from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.rbac import ADMIN_ROLE_IDS, HCNS_ROLE_IDS
from app.models.tai_khoan import TaiKhoan
from app.models.thong_bao import ThongBao
from app.repositories.thong_bao_repo import ThongBaoRepository
from app.schemas.thong_bao_schema import (
    DoiTuongNhan,
    ThongBaoCreate,
    ThongBaoResponse,
    ThongBaoUnreadCount,
)

MANAGER_ROLE_IDS = {"MANAGER", "Manager", "QUAN_LY", "QuanLy"}


class ThongBaoService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = ThongBaoRepository(session)

    def list_notifications(
        self,
        current_user: TaiKhoan,
        page: int,
        size: int,
    ) -> list[ThongBaoResponse]:
        """UC22: get current user's notifications sorted by sent time descending."""
        # BR22-1: mặc định sort theo thoiGianGui giảm dần và trả trangThaiDoc rõ ràng.
        rows = self.repo.list_by_receiver(current_user.id_TaiKhoan, (page - 1) * size, size)
        return [self._to_response(item) for item in rows]

    def count_unread(self, current_user: TaiKhoan) -> ThongBaoUnreadCount:
        """UC22: count unread notifications for the badge endpoint."""
        return ThongBaoUnreadCount(
            so_luong_chua_doc=self.repo.count_unread(current_user.id_TaiKhoan)
        )

    def mark_read(self, id_thong_bao: str, current_user: TaiKhoan) -> ThongBaoResponse:
        """UC22: mark one owned notification as read."""
        thong_bao = self.repo.get(id_thong_bao)
        if thong_bao is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy thông báo")
        if thong_bao.id_NguoiNhan != current_user.id_TaiKhoan:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn không có quyền cập nhật thông báo này")
        thong_bao.trangThaiDoc = 1
        return self._to_response(self.repo.save(thong_bao))

    def mark_all_read(self, current_user: TaiKhoan) -> dict[str, int]:
        """UC22: mark all current user's unread notifications as read."""
        rows = self.repo.list_unread_by_receiver(current_user.id_TaiKhoan)
        for item in rows:
            item.trangThaiDoc = 1
            self.repo.save(item, commit=False)
        self.session.commit()
        return {"so_luong_da_cap_nhat": len(rows)}

    def create_notification(
        self,
        payload: ThongBaoCreate,
        current_user: TaiKhoan,
    ) -> dict[str, object]:
        """UC23: resolve recipients and insert one ThongBao row per receiver."""
        if not self._can_create(current_user):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn không có quyền tạo thông báo")
        receiver_ids = self._resolve_receivers(payload, current_user)
        if not receiver_ids:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Danh sách người nhận không được để trống")

        now = datetime.now()
        created: list[ThongBao] = []
        try:
            for receiver_id in sorted(set(receiver_ids)):
                thong_bao = ThongBao(
                    id_ThongBao=f"TB-{uuid4().hex[:12]}",
                    id_NguoiNhan=receiver_id,
                    tieuDe=payload.tieuDe,
                    noiDung=payload.noiDung,
                    loaiThongBao=payload.loaiThongBao,
                    trangThaiDoc=0,
                    thoiGianGui=now,
                )
                self.repo.save(thong_bao, commit=False)
                created.append(thong_bao)
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

        # Giới hạn: bảng ThongBao không lưu người gửi, không hỗ trợ tra cứu ngược "ai đã gửi".
        # BR23-3: sau khi gửi không có endpoint sửa nội dung/thu hồi trong batch này.
        # TODO: với số lượng người nhận lớn, chuyển insert sang background task/queue để bảo đảm <2s.
        return {
            "so_luong_nguoi_nhan": len(created),
            "id_thong_bao": [item.id_ThongBao for item in created],
        }

    def _resolve_receivers(
        self,
        payload: ThongBaoCreate,
        current_user: TaiKhoan,
    ) -> list[str]:
        if payload.doi_tuong_nhan == DoiTuongNhan.TOAN_CONG_TY:
            if not self._is_hcns_or_admin(current_user):
                # BR23-2: quản lý không được gửi toàn công ty; HCNS/Admin được gửi toàn công ty.
                raise HTTPException(status.HTTP_403_FORBIDDEN, "Chỉ HCNS/Admin được gửi toàn công ty")
            # BR23-1: toàn công ty là tất cả NhanVien đang làm việc.
            return self.repo.list_active_employee_ids()

        if payload.doi_tuong_nhan == DoiTuongNhan.PHONG_BAN:
            # BR23-1: chưa có bảng phòng ban/dự án trong 19 bảng B1 nên không tự resolve.
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Chưa có dữ liệu phòng ban/dự án để resolve người nhận",
            )

        ids = payload.id_nhan_vien_list or []
        # BR23-1: cá nhân cụ thể dùng danh sách id_NhanVien do người dùng chọn tay.
        for id_nhan_vien in ids:
            if not self.repo.employee_exists(id_nhan_vien):
                raise HTTPException(status.HTTP_404_NOT_FOUND, f"Không tìm thấy nhân viên {id_nhan_vien}")
        if not self._is_hcns_or_admin(current_user) and current_user.id_VaiTro in MANAGER_ROLE_IDS:
            # BR23-2: chưa có cơ chế phạm vi quản lý từ B4/B5, nên không tự suy diễn quyền gửi cho cấp dưới.
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Chưa có cấu hình phạm vi quản lý để gửi thông báo cá nhân",
            )
        return ids

    def _to_response(self, thong_bao: ThongBao) -> ThongBaoResponse:
        # BR22-2: schema DB chưa có id đối tượng liên quan, nên trả None và giữ loaiThongBao để frontend điều hướng cơ bản.
        return ThongBaoResponse(
            id_ThongBao=thong_bao.id_ThongBao,
            id_NguoiNhan=thong_bao.id_NguoiNhan,
            tieuDe=thong_bao.tieuDe,
            noiDung=thong_bao.noiDung,
            loaiThongBao=thong_bao.loaiThongBao,
            trangThaiDoc=thong_bao.trangThaiDoc,
            thoiGianGui=thong_bao.thoiGianGui,
            id_doi_tuong_lien_quan=None,
        )

    def _can_create(self, current_user: TaiKhoan) -> bool:
        return current_user.id_VaiTro in (ADMIN_ROLE_IDS | HCNS_ROLE_IDS | MANAGER_ROLE_IDS)

    def _is_hcns_or_admin(self, current_user: TaiKhoan) -> bool:
        return current_user.id_VaiTro in (ADMIN_ROLE_IDS | HCNS_ROLE_IDS)
