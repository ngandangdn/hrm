from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.tai_khoan import TaiKhoan
from app.models.yeu_cau_cap_nhat_ho_so import YeuCauCapNhatHoSo
from app.repositories.yeu_cau_cap_nhat_repo import YeuCauCapNhatRepository
from app.schemas.phe_duyet_schema import TuChoiRequest


class PheDuyetService:
    def __init__(self, session: Session) -> None:
        self.repo = YeuCauCapNhatRepository(session)

    def list_pending(self) -> list[YeuCauCapNhatHoSo]:
        """List all profile-update requests that are still waiting for approval."""
        return self.repo.list_pending()

    def approve(self, id_yeu_cau: str, current_user: TaiKhoan) -> YeuCauCapNhatHoSo:
        """Approve one request, map detail fields to NhanVien, and close the request."""
        request = self._get_pending_request(id_yeu_cau, current_user)
        nhan_vien = self.repo.get_nhan_vien(request.id_NhanVien)
        if nhan_vien is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy hồ sơ nhân viên")

        for detail in self.repo.list_details(id_yeu_cau):
            if not hasattr(nhan_vien, detail.tenTruong):
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"Trường {detail.tenTruong} không tồn tại trong hồ sơ nhân viên",
                )
            # Mapping dynamic: tenTruong được lưu đúng tên thuộc tính model NhanVien.
            setattr(nhan_vien, detail.tenTruong, detail.giaTriMoi)

        # BR08-4: dữ liệu gốc chỉ được ghi đè đúng một lần tại thời điểm duyệt.
        self.repo.save_nhan_vien(nhan_vien)
        request.trangThai = 1
        request.nguoiDuyet = current_user.id_TaiKhoan
        request.thoiGianDuyet = datetime.now()
        return self.repo.save(request)

    def reject(
        self,
        id_yeu_cau: str,
        payload: TuChoiRequest,
        current_user: TaiKhoan,
    ) -> YeuCauCapNhatHoSo:
        """Reject one pending request and keep the original NhanVien data unchanged."""
        # BR03-1/BR08-2: từ chối bắt buộc phải có lý do.
        if not payload.ghiChu.strip():
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Lý do từ chối là bắt buộc")
        request = self._get_pending_request(id_yeu_cau, current_user)
        request.trangThai = 2
        request.ghiChu = payload.ghiChu
        request.nguoiDuyet = current_user.id_TaiKhoan
        request.thoiGianDuyet = datetime.now()
        return self.repo.save(request)

    def _get_pending_request(
        self,
        id_yeu_cau: str,
        current_user: TaiKhoan,
    ) -> YeuCauCapNhatHoSo:
        request = self.repo.get_by_id(id_yeu_cau)
        if request is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy yêu cầu")
        # BR08-3: HCNS không được tự phê duyệt/từ chối yêu cầu của chính mình.
        if request.id_NhanVien == current_user.id_TaiKhoan:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Không thể tự phê duyệt yêu cầu của chính mình",
            )
        # BR08-5: phiếu đã duyệt/từ chối bị đóng băng trạng thái.
        if request.trangThai != 0:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Yêu cầu không còn ở trạng thái chờ phê duyệt",
            )
        return request
