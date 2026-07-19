from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.rbac import ADMIN_ROLE_IDS, HCNS_ROLE_IDS
from app.models.don_nghi_phep import DonNghiPhep
from app.models.quy_phep import QuyPhep
from app.models.tai_khoan import TaiKhoan
from app.repositories.don_nghi_phep_repo import DonNghiPhepRepository
from app.repositories.quy_phep_repo import QuyPhepRepository
from app.schemas.nghi_phep_schema import (
    BangPhepItem,
    DonNghiPhepCreate,
    DonNghiPhepDetail,
    DonNghiPhepResponse,
    TuChoiDonRequest,
)
from app.utils.lich_lam_viec import tinh_so_ngay_nghi_thuc_te

LEAVE_TYPES_DEDUCT_QUOTA = {"Phép năm", "phep nam", "Phep nam", "annual"}


class NghiPhepService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.quy_repo = QuyPhepRepository(session)
        self.don_repo = DonNghiPhepRepository(session)

    def get_bang_phep(
        self,
        current_user: TaiKhoan,
        nam: int,
        page: int,
        size: int,
    ) -> list[BangPhepItem]:
        """UC11: return leave quota table for the caller's allowed scope."""
        if self._is_hcns_or_admin(current_user):
            quotas = self.quy_repo.list_by_year(nam, (page - 1) * size, size)
        else:
            # BR11-1: nhân viên chỉ xem quỹ phép của chính mình; chưa có scope quản lý nên không suy diễn.
            quota = self.quy_repo.get_by_employee_year(current_user.id_TaiKhoan, nam)
            quotas = [quota] if quota else []
        return [self._to_bang_phep_item(item) for item in quotas]

    def get_lich_su(
        self,
        current_user: TaiKhoan,
        id_nhan_vien: str | None,
        nam: int,
        thang: int | None,
        page: int,
        size: int,
    ) -> list[DonNghiPhepResponse]:
        """UC12: list leave history by year/month, sorted by newest request first."""
        target_id = id_nhan_vien or current_user.id_TaiKhoan
        self._assert_can_view_employee(current_user, target_id)
        rows = self.don_repo.list_by_employee(target_id, nam, thang, (page - 1) * size, size)
        # BR12-4: trả đủ mọi trạng thái, không lọc ẩn trạng thái nào.
        return [self._to_response(item, current_user) for item in rows]

    def create_don(self, payload: DonNghiPhepCreate, current_user: TaiKhoan) -> DonNghiPhepResponse:
        """UC13: create a pending leave request and reserve quota in one transaction."""
        # BR13-1: tuNgay phải nhỏ hơn hoặc bằng denNgay.
        if payload.tuNgay > payload.denNgay:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Từ ngày phải nhỏ hơn hoặc bằng đến ngày")
        so_ngay = tinh_so_ngay_nghi_thuc_te(payload.tuNgay, payload.denNgay)
        quy_phep = self.quy_repo.get(payload.id_QuyPhep)
        if quy_phep is None or quy_phep.id_NhanVien != current_user.id_TaiKhoan:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy quỹ phép hợp lệ")
        if payload.loaiPhep in LEAVE_TYPES_DEDUCT_QUOTA:
            con_lai = self._so_ngay_con_lai(quy_phep)
            # BR13-2: Phép năm không được vượt quá số ngày còn lại theo BR11-2.
            if so_ngay > con_lai:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Không đủ quỹ phép năm")

        don = DonNghiPhep(
            id_DonPhep=f"DNP-{uuid4().hex[:12]}",
            loaiPhep=payload.loaiPhep,
            ngayTao=datetime.now(),
            tuNgay=payload.tuNgay,
            denNgay=payload.denNgay,
            trangThai=0,
            lyDo=payload.lyDo[:255],
            nguoiDuyet="PENDING",
            id_NhanVien=current_user.id_TaiKhoan,
            id_QuyPhep=payload.id_QuyPhep,
        )
        try:
            self.don_repo.save(don, commit=False)
            if payload.loaiPhep in LEAVE_TYPES_DEDUCT_QUOTA:
                # UC13 transaction: tạo đơn + cộng soNgayChoDuyet cùng lúc.
                quy_phep.soNgayChoDuyet = (quy_phep.soNgayChoDuyet or Decimal("0")) + so_ngay
                self.quy_repo.save(quy_phep, commit=False)
            self.session.commit()
            self.session.refresh(don)
        except Exception:
            self.session.rollback()
            raise
        return self._to_response(don, current_user)

    def list_don(
        self,
        current_user: TaiKhoan,
        nam: int | None,
        trang_thai: int | None,
        tu_ngay: date | None,
        den_ngay: date | None,
        page: int,
        size: int,
    ) -> list[DonNghiPhepResponse]:
        """UC14: list leave requests by role, filters, pagination, and newest-first order."""
        if self._is_hcns_or_admin(current_user):
            rows = self.don_repo.list_all(nam, trang_thai, tu_ngay, den_ngay, (page - 1) * size, size)
        else:
            # BR14-1: nhân viên chỉ xem đơn của mình; chưa có scope quản lý nên không suy diễn.
            year = nam or datetime.now().year
            rows = self.don_repo.list_by_employee(current_user.id_TaiKhoan, year, None, (page - 1) * size, size)
            if trang_thai is not None:
                rows = [item for item in rows if item.trangThai == trang_thai]
        # BR14-3: bộ lọc hỗ trợ đủ 4 trạng thái qua trường trangThai.
        return [self._to_response(item, current_user) for item in rows]

    def get_detail(self, id_don: str, current_user: TaiKhoan) -> DonNghiPhepDetail:
        """UC15: return leave request detail with cancel flag and processing history."""
        don = self._get_don_or_404(id_don)
        self._assert_can_view_employee(current_user, don.id_NhanVien or "")
        response = self._to_response(don, current_user)
        # BR15-2: chỉ chính chủ đơn và trạng thái chờ duyệt mới có thể hủy.
        response.co_the_huy = don.id_NhanVien == current_user.id_TaiKhoan and don.trangThai == 0
        # BR15-3: response bao gồm lịch sử xử lý cơ bản từ các field hiện có.
        history = {
            "ngay_tao": don.ngayTao,
            "thoi_gian_duyet": don.thoiGianDuyet,
            "nguoi_thuc_hien": don.nguoiDuyet,
            "ly_do_tu_choi": don.lyDoTuChoi,
        }
        return DonNghiPhepDetail(don=response, lich_su_xu_ly=history)

    def approve(self, id_don: str, current_user: TaiKhoan) -> DonNghiPhepResponse:
        """UC16: approve a pending request and move reserved quota to used quota."""
        don = self._get_pending_for_decision(id_don, current_user)
        quy_phep = self._get_quy_for_don(don)
        so_ngay = tinh_so_ngay_nghi_thuc_te(don.tuNgay, don.denNgay)
        try:
            don.trangThai = 1
            don.nguoiDuyet = current_user.id_TaiKhoan
            don.thoiGianDuyet = datetime.now()
            self.don_repo.save(don, commit=False)
            if don.loaiPhep in LEAVE_TYPES_DEDUCT_QUOTA:
                # UC16 transaction: soNgayChoDuyet -= đơn, soNgayDaDung += đơn.
                quy_phep.soNgayChoDuyet = max(Decimal("0"), (quy_phep.soNgayChoDuyet or Decimal("0")) - so_ngay)
                quy_phep.soNgayDaDung = (quy_phep.soNgayDaDung or Decimal("0")) + so_ngay
                self.quy_repo.save(quy_phep, commit=False)
            self.session.commit()
            self.session.refresh(don)
        except Exception:
            self.session.rollback()
            raise
        return self._to_response(don, current_user)

    def reject(
        self,
        id_don: str,
        payload: TuChoiDonRequest,
        current_user: TaiKhoan,
    ) -> DonNghiPhepResponse:
        """UC16: reject a pending request, require reason, and return reserved quota."""
        # BR16-2: từ chối bắt buộc phải có lý do.
        if not payload.lyDoTuChoi.strip():
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Lý do từ chối là bắt buộc")
        don = self._get_pending_for_decision(id_don, current_user)
        try:
            don.trangThai = 2
            don.lyDoTuChoi = payload.lyDoTuChoi
            don.nguoiDuyet = current_user.id_TaiKhoan
            don.thoiGianDuyet = datetime.now()
            self.don_repo.save(don, commit=False)
            self._hoan_quy_phep_cho_duyet(don)
            self.session.commit()
            self.session.refresh(don)
        except Exception:
            self.session.rollback()
            raise
        return self._to_response(don, current_user)

    def cancel(self, id_don: str, current_user: TaiKhoan) -> DonNghiPhepResponse:
        """UC17: let the owner cancel a pending request and return reserved quota."""
        don = self._get_don_or_404(id_don)
        # BR17-1: chỉ người tạo đơn được hủy đơn của chính mình.
        if don.id_NhanVien != current_user.id_TaiKhoan:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn chỉ được hủy đơn của chính mình")
        # BR17-2: chỉ hủy được đơn đang chờ duyệt.
        if don.trangThai != 0:
            raise HTTPException(status.HTTP_409_CONFLICT, "Chỉ hủy được đơn đang chờ duyệt")
        try:
            don.trangThai = 3
            self.don_repo.save(don, commit=False)
            self._hoan_quy_phep_cho_duyet(don)
            self.session.commit()
            self.session.refresh(don)
        except Exception:
            self.session.rollback()
            raise
        return self._to_response(don, current_user)

    def _to_bang_phep_item(self, quy_phep: QuyPhep) -> BangPhepItem:
        return BangPhepItem(
            id_QuyPhep=quy_phep.id_QuyPhep,
            id_NhanVien=quy_phep.id_NhanVien,
            nam=quy_phep.nam,
            tongQuyPhep=quy_phep.tongQuyPhep,
            soNgayDaDung=quy_phep.soNgayDaDung,
            soNgayChoDuyet=quy_phep.soNgayChoDuyet,
            so_ngay_con_lai=self._so_ngay_con_lai(quy_phep),
            trangThai=quy_phep.trangThai,
        )

    def _to_response(self, don: DonNghiPhep, current_user: TaiKhoan) -> DonNghiPhepResponse:
        return DonNghiPhepResponse(
            id_DonPhep=don.id_DonPhep,
            loaiPhep=don.loaiPhep,
            ngayTao=don.ngayTao,
            tuNgay=don.tuNgay,
            denNgay=don.denNgay,
            so_ngay_nghi=tinh_so_ngay_nghi_thuc_te(don.tuNgay, don.denNgay),
            trangThai=don.trangThai,
            lyDo=don.lyDo,
            lyDoTuChoi=don.lyDoTuChoi,
            thoiGianDuyet=don.thoiGianDuyet,
            nguoiDuyet=don.nguoiDuyet,
            id_NhanVien=don.id_NhanVien,
            id_QuyPhep=don.id_QuyPhep,
            co_the_huy=don.id_NhanVien == current_user.id_TaiKhoan and don.trangThai == 0,
        )

    def _so_ngay_con_lai(self, quy_phep: QuyPhep) -> Decimal:
        # BR11-2: còn lại = tổng quỹ - (đã dùng + chờ duyệt); đơn từ chối/hủy không trừ.
        remaining = quy_phep.tongQuyPhep - (
            (quy_phep.soNgayDaDung or Decimal("0")) + (quy_phep.soNgayChoDuyet or Decimal("0"))
        )
        return max(Decimal("0"), remaining)

    def _get_don_or_404(self, id_don: str) -> DonNghiPhep:
        don = self.don_repo.get(id_don)
        if don is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy đơn nghỉ phép")
        return don

    def _get_pending_for_decision(self, id_don: str, current_user: TaiKhoan) -> DonNghiPhep:
        don = self._get_don_or_404(id_don)
        # BR16-1: chỉ HCNS/Admin được duyệt trong khi chưa có scope quản lý trực tiếp.
        if not self._is_hcns_or_admin(current_user):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn không có quyền duyệt đơn nghỉ phép")
        if don.id_NhanVien == current_user.id_TaiKhoan:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Không được tự duyệt đơn của chính mình")
        # BR16-3: đã duyệt/từ chối/hủy thì đóng băng trạng thái.
        if don.trangThai != 0:
            raise HTTPException(status.HTTP_409_CONFLICT, "Đơn không còn ở trạng thái chờ duyệt")
        return don

    def _get_quy_for_don(self, don: DonNghiPhep) -> QuyPhep:
        quy_phep = self.quy_repo.get(don.id_QuyPhep)
        if quy_phep is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy quỹ phép của đơn")
        return quy_phep

    def _hoan_quy_phep_cho_duyet(self, don: DonNghiPhep) -> None:
        if don.loaiPhep not in LEAVE_TYPES_DEDUCT_QUOTA:
            return
        quy_phep = self._get_quy_for_don(don)
        so_ngay = tinh_so_ngay_nghi_thuc_te(don.tuNgay, don.denNgay)
        quy_phep.soNgayChoDuyet = max(Decimal("0"), (quy_phep.soNgayChoDuyet or Decimal("0")) - so_ngay)
        self.quy_repo.save(quy_phep, commit=False)

    def _assert_can_view_employee(self, current_user: TaiKhoan, id_nhan_vien: str) -> None:
        if self._is_hcns_or_admin(current_user):
            return
        # BR12-1/BR15-1: nhân viên chỉ xem đơn của chính mình; HCNS/Admin xem hộ.
        if current_user.id_TaiKhoan != id_nhan_vien:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn không có quyền xem dữ liệu này")

    def _is_hcns_or_admin(self, current_user: TaiKhoan) -> bool:
        return current_user.id_VaiTro in (HCNS_ROLE_IDS | ADMIN_ROLE_IDS)
