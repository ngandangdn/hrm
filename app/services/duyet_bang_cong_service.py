import logging
from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.bang_cong import BangCong
from app.models.don_giai_trinh_cong import DonGiaiTrinhCong
from app.models.tai_khoan import TaiKhoan
from app.repositories.bang_cong_repo import BangCongRepository
from app.repositories.don_giai_trinh_cong_repo import DonGiaiTrinhCongRepository
from app.schemas.cham_cong_schema import DongYGiaiTrinhRequest, TuChoiGiaiTrinhRequest
from app.services.cham_cong_scope import assert_can_access_employee, is_hcns_or_admin

logger = logging.getLogger(__name__)


class DuyetBangCongService:
    def __init__(self, session: Session) -> None:
        self.bang_cong_repo = BangCongRepository(session)
        self.don_repo = DonGiaiTrinhCongRepository(session)

    def list_for_approval(self, current_user: TaiKhoan) -> dict[str, object]:
        """Return attendance grid and pending explanations in the caller's allowed scope."""
        if is_hcns_or_admin(current_user):
            bang_cong_list = self.bang_cong_repo.list_all()
        else:
            # BR19-1: chưa có cơ chế phạm vi quản lý từ B4, nên quản lý không được xem người khác.
            bang_cong_list = self.bang_cong_repo.list_by_employee(current_user.id_TaiKhoan)
        pending = self.don_repo.list_pending_all()
        return {"bang_cong": bang_cong_list, "don_giai_trinh_cho_duyet": pending}

    def approve_explanation(
        self,
        id_don: str,
        payload: DongYGiaiTrinhRequest,
        current_user: TaiKhoan,
    ) -> DonGiaiTrinhCong:
        """Approve one explanation and add the accepted hours to actual attendance hours."""
        don = self._get_pending_don_and_assert_scope(id_don, current_user)
        bang_cong = self._get_editable_bang_cong(don.id_BangCong)
        don.trangThai = 1
        don.nguoiDuyet = current_user.id_TaiKhoan
        don.thoiGianDuyet = datetime.now()
        # Khi đồng ý, cộng số giờ/công tương ứng vào tongGioLogtimeThucTe; từ chối thì không cộng.
        current_hours = bang_cong.tongGioLogtimeThucTe or Decimal("0")
        bang_cong.tongGioLogtimeThucTe = current_hours + payload.soGioCong
        bang_cong.ngayCapNhat = datetime.now()
        self.bang_cong_repo.save(bang_cong)
        logger.info("audit_approve_explanation id_Don=%s nguoiDuyet=%s", id_don, current_user.id_TaiKhoan)
        return self.don_repo.save(don)

    def reject_explanation(
        self,
        id_don: str,
        payload: TuChoiGiaiTrinhRequest,
        current_user: TaiKhoan,
    ) -> DonGiaiTrinhCong:
        """Reject one explanation with a mandatory reason and no attendance-hour adjustment."""
        don = self._get_pending_don_and_assert_scope(id_don, current_user)
        self._get_editable_bang_cong(don.id_BangCong)
        don.trangThai = 2
        don.lyDoTuChoi = payload.lyDoTuChoi
        don.nguoiDuyet = current_user.id_TaiKhoan
        don.thoiGianDuyet = datetime.now()
        logger.info("audit_reject_explanation id_Don=%s nguoiDuyet=%s", id_don, current_user.id_TaiKhoan)
        return self.don_repo.save(don)

    def finalize_bang_cong(self, id_bang_cong: str, current_user: TaiKhoan) -> BangCong:
        """Finalize an attendance period after all pending explanation requests are resolved."""
        bang_cong = self._get_editable_bang_cong(id_bang_cong)
        assert_can_access_employee(current_user, bang_cong.id_NhanVien)
        # BR19-2: chỉ chốt bảng công khi không còn đơn giải trình chờ duyệt trong kỳ đó.
        if self.don_repo.list_pending_for_bang_cong(id_bang_cong):
            raise HTTPException(status.HTTP_409_CONFLICT, "Còn đơn giải trình chờ duyệt, chưa thể chốt bảng công")
        bang_cong.trangThai = 1
        bang_cong.ngayCapNhat = datetime.now()
        logger.info("audit_finalize_bang_cong id_BangCong=%s nguoiDuyet=%s", id_bang_cong, current_user.id_TaiKhoan)
        return self.bang_cong_repo.save(bang_cong)

    def _get_pending_don_and_assert_scope(
        self,
        id_don: str,
        current_user: TaiKhoan,
    ) -> DonGiaiTrinhCong:
        don = self.don_repo.get(id_don)
        if don is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy đơn giải trình công")
        if don.trangThai != 0:
            raise HTTPException(status.HTTP_409_CONFLICT, "Đơn giải trình không còn chờ duyệt")
        assert_can_access_employee(current_user, don.id_NhanVien)
        return don

    def _get_editable_bang_cong(self, id_bang_cong: str) -> BangCong:
        bang_cong = self.bang_cong_repo.get(id_bang_cong)
        if bang_cong is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy bảng công")
        # BR19-3: sau khi chốt, mọi API sửa từ phía quản lý bị khóa.
        if bang_cong.trangThai == 1:
            raise HTTPException(status.HTTP_409_CONFLICT, "Bảng công đã chốt, không thể chỉnh sửa")
        return bang_cong
