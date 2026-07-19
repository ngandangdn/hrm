from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlmodel import Session

from app.models.chi_tiet_cap_nhat_ho_so import ChiTietCapNhatHoSo
from app.models.tai_khoan import TaiKhoan
from app.models.yeu_cau_cap_nhat_ho_so import YeuCauCapNhatHoSo
from app.repositories.yeu_cau_cap_nhat_repo import YeuCauCapNhatRepository
from app.schemas.ho_so_schema import ChiTietCapNhatItem, YeuCauCapNhatCreate

TRUONG_BI_KHOA = {"maNhanVien", "phongBan", "chucDanh", "mucLuong"}
NHOM_CAN_MINH_CHUNG = {"phap_ly", "pháp lý", "tai_chinh", "tài chính", "van_bang", "văn bằng"}
ALLOWED_FILE_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 5 * 1024 * 1024


class YeuCauCapNhatService:
    def __init__(self, session: Session) -> None:
        self.repo = YeuCauCapNhatRepository(session)

    async def create_request(
        self,
        payload: YeuCauCapNhatCreate,
        current_user: TaiKhoan,
        file: UploadFile | None,
    ) -> YeuCauCapNhatHoSo:
        """Create a profile-update request, validate UC02/UC07 rules, and persist details."""
        nhan_vien = self.repo.get_nhan_vien(current_user.id_TaiKhoan)
        if nhan_vien is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy hồ sơ nhân viên")

        # BR02-3/BR07-1: mỗi nhân viên chỉ có tối đa 1 yêu cầu chờ phê duyệt.
        if self.repo.has_pending_request(nhan_vien.id_NhanVien):
            raise HTTPException(status.HTTP_409_CONFLICT, "Bạn đã có yêu cầu đang chờ phê duyệt")

        self._validate_details(payload.chiTiet, file)
        if file is not None:
            await self._validate_file(file)

        request_id = f"YC-{uuid4().hex[:12]}"
        request = YeuCauCapNhatHoSo(
            id_YeuCau=request_id,
            ngayGui=datetime.now(),
            trangThai=0,
            nguoiDuyet="PENDING",
            id_NhanVien=nhan_vien.id_NhanVien,
        )
        details = [
            ChiTietCapNhatHoSo(
                id_ChiTiet=f"CT-{uuid4().hex[:12]}",
                id_YeuCau=request_id,
                tenTruong=item.tenTruong,
                nhomThongTin=item.nhomThongTin,
                giaTriCu=item.giaTriCu,
                giaTriMoi=item.giaTriMoi,
                ghiChu=item.ghiChu,
            )
            for item in payload.chiTiet
        ]
        # BR02-2/BR07-4: gửi yêu cầu không làm thay đổi ngay dữ liệu gốc NhanVien.
        return self.repo.create(request, details)

    def get_detail(self, id_yeu_cau: str, current_user: TaiKhoan) -> dict[str, object]:
        """Return one request and its changed-field details."""
        request = self.repo.get_by_id(id_yeu_cau)
        if request is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy yêu cầu")
        if current_user.id_VaiTro not in {"ADMIN", "Admin", "admin", "HCNS", "HR"} and request.id_NhanVien != current_user.id_TaiKhoan:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn không có quyền xem yêu cầu này")
        return {"yeu_cau": request, "chi_tiet": self.repo.list_details(id_yeu_cau)}

    def cancel_request(self, id_yeu_cau: str, current_user: TaiKhoan) -> YeuCauCapNhatHoSo:
        """Allow an employee to cancel their own pending profile-update request."""
        request = self.repo.get_by_id(id_yeu_cau)
        if request is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy yêu cầu")
        if request.id_NhanVien != current_user.id_TaiKhoan:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn không có quyền hủy yêu cầu này")
        if request.trangThai != 0:
            raise HTTPException(status.HTTP_409_CONFLICT, "Chỉ được hủy yêu cầu đang chờ phê duyệt")
        request.trangThai = 2
        request.ghiChu = "Nhân viên tự hủy yêu cầu"
        return self.repo.save(request)

    def _validate_details(self, details: list[ChiTietCapNhatItem], file: UploadFile | None) -> None:
        for detail in details:
            # BR02-4/BR07-3: không cho sửa các trường do công ty quản lý.
            if detail.tenTruong in TRUONG_BI_KHOA:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Không được yêu cầu sửa trường công ty quản lý")
        requires_evidence = any(item.nhomThongTin.lower() in NHOM_CAN_MINH_CHUNG for item in details)
        # BR02-1/BR07-2: thông tin pháp lý/tài chính/văn bằng bắt buộc có minh chứng.
        if requires_evidence and file is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nhóm thông tin này bắt buộc có tệp minh chứng")

    async def _validate_file(self, file: UploadFile) -> None:
        filename = file.filename or ""
        extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if extension not in ALLOWED_FILE_EXTENSIONS:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Tệp minh chứng chỉ chấp nhận pdf, jpg, jpeg, png")
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Tệp minh chứng vượt quá giới hạn 5MB")
        await file.seek(0)
