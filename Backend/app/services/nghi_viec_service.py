import logging
from datetime import datetime, time
from uuid import uuid4

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.rbac import HCNS_ROLE_IDS
from app.core.scheduler import schedule_employee_deactivation
from app.models.don_nghi_viec import DonNghiViec
from app.models.quyet_dinh_nghi_viec import QuyetDinhNghiViec
from app.models.tai_khoan import TaiKhoan
from app.repositories.nghi_viec_repo import NghiViecRepository
from app.schemas.nghi_viec_schema import DonNghiViecCreate, QuyetDinhNghiViecCreate

logger = logging.getLogger(__name__)


class NghiViecService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = NghiViecRepository(session)

    def create_don(self, payload: DonNghiViecCreate, id_nhan_vien: str, is_draft: bool = False) -> dict[str, object]:
        """Create a resignation request from token-owned employee data and return soft warnings."""
        nhan_vien = self.repo.get_nhan_vien(id_nhan_vien)
        if nhan_vien is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy hồ sơ nhân viên")
        # BR09-2: chỉ tài khoản đang làm việc mới được tạo đơn nghỉ việc.
        if nhan_vien.trangThaiLamViec != 1:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Chỉ nhân viên đang làm việc mới được tạo đơn")

        warning = self._build_notice_warning(payload, id_nhan_vien)
        don = DonNghiViec(
            id_DonNghiViec=f"DNV-{uuid4().hex[:12]}",
            ngayTao=datetime.now(),
            ngayLamViecCuoi=payload.ngayLamViecCuoi,
            lyDoNghiViec=payload.lyDoNghiViec,
            noiDungBanGiao=payload.noiDungBanGiao,
            # Lưu nháp dùng trạng thái -1 vì bảng B1 không có enum riêng cho nháp.
            trangThai=-1 if is_draft else 0,
            ghiChu=payload.ghiChu,
            # BR09-1: id_NhanVien lấy từ token, không nhận tùy ý từ body request.
            id_NhanVien=id_nhan_vien,
        )
        saved = self.repo.create_don(don)
        # TODO: tích hợp queue/background task thật để thông báo quản lý trực tiếp + HCNS trong 1 phút.
        logger.info("mock_notify_resignation id_DonNghiViec=%s id_NhanVien=%s", saved.id_DonNghiViec, id_nhan_vien)
        return {"don_nghi_viec": saved, "canh_bao": warning is not None, "noi_dung_canh_bao": warning}

    def get_don(self, id_don: str) -> DonNghiViec:
        """Return resignation-request detail for UC09 and UC10 include flow."""
        don = self.repo.get_don(id_don)
        if don is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy đơn nghỉ việc")
        return don

    def list_don(self, current_user: TaiKhoan) -> list[DonNghiViec]:
        """Return list of resignation requests. HCNS sees all, others see their own."""
        if current_user.id_VaiTro in HCNS_ROLE_IDS:
            return self.repo.list_don()
        return self.repo.list_don(id_nhan_vien=current_user.id_TaiKhoan)

    def create_quyet_dinh(self, payload: QuyetDinhNghiViecCreate) -> QuyetDinhNghiViec:
        """Validate and issue a resignation decision, then schedule effective deactivation."""
        don = self.get_don(payload.id_DonNghiViec)
        # BR10-2: số quyết định là duy nhất, validate trước khi lưu.
        if self.repo.exists_so_quyet_dinh(payload.soQuyetDinh):
            raise HTTPException(status.HTTP_409_CONFLICT, "Số quyết định đã tồn tại")
        # BR10-3: ngày ký phải nhỏ hơn hoặc bằng ngày hiệu lực.
        if payload.ngayKy > payload.ngayHieuLuc:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Ngày ký phải nhỏ hơn hoặc bằng ngày hiệu lực")

        quyet_dinh = QuyetDinhNghiViec(
            id_QuyetDinh=f"QDNV-{uuid4().hex[:12]}",
            soQuyetDinh=payload.soQuyetDinh,
            ngayKy=payload.ngayKy,
            nguoiKy=payload.nguoiKy,
            lyDoNghiViec=payload.lyDoNghiViec,
            tepQuyetDinh=payload.tepQuyetDinh,
            id_DonNghiViec=payload.id_DonNghiViec,
        )
        saved = self.repo.create_quyet_dinh(quyet_dinh)
        if payload.banHanh:
            run_at = datetime.combine(payload.ngayHieuLuc, time.min)
            # BR10-4: ban hành thì lên lịch chuyển nghỉ việc và gọi revoke_all_roles.
            schedule_employee_deactivation(don.id_NhanVien, run_at)
            logger.info("audit_issue_resignation_decision id_QuyetDinh=%s", saved.id_QuyetDinh)
        # TODO: export PDF/Word có watermark và chữ ký số ở module tài liệu riêng.
        return saved

    def get_quyet_dinh(self, id_quyet_dinh: str) -> QuyetDinhNghiViec:
        """Return resignation-decision detail."""
        quyet_dinh = self.repo.get_quyet_dinh(id_quyet_dinh)
        if quyet_dinh is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy quyết định nghỉ việc")
        return quyet_dinh

    def _build_notice_warning(self, payload: DonNghiViecCreate, id_nhan_vien: str) -> str | None:
        hop_dong = self.repo.get_hop_dong_hien_hanh(id_nhan_vien)
        days_notice = (payload.ngayLamViecCuoi - datetime.now().date()).days
        if hop_dong is None:
            return None
        # Bảng HopDong B1 không có field thời gian báo trước; đây là cảnh báo mềm, không chặn cứng.
        if days_notice < 30:
            return "Thời gian báo trước dưới 30 ngày; hệ thống vẫn cho gửi để HCNS xem xét"
        return None
