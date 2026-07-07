from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.rbac import HCNS_ROLE_IDS
from app.models.tai_khoan import TaiKhoan
from app.repositories.ho_so_ca_nhan_repo import HoSoCaNhanRepository
from app.schemas.ho_so_ca_nhan_schema import (
    CongViec,
    HoSoCaNhanResponse,
    HopDongHienHanh,
    LienHe,
    ThongTinChung,
)


class HoSoCaNhanService:
    def __init__(self, session: Session) -> None:
        self.repo = HoSoCaNhanRepository(session)

    def get_profile(self, id_nhan_vien: str, current_user: TaiKhoan) -> HoSoCaNhanResponse:
        """Fetch the approved employee profile and current contract for UC06 display tabs."""
        # BR06-1: nhân viên/CTV/TTS chỉ xem hồ sơ của chính mình, HCNS được xem toàn công ty.
        if current_user.id_VaiTro not in HCNS_ROLE_IDS and current_user.id_TaiKhoan != id_nhan_vien:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn chỉ được xem hồ sơ của chính mình")

        nhan_vien = self.repo.get_nhan_vien(id_nhan_vien)
        if nhan_vien is None:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Không tìm thấy hồ sơ nhân viên, vui lòng liên hệ HCNS",
            )

        # BR06-2: chỉ lấy dữ liệu gốc đã duyệt từ NhanVien/HopDong, không trộn yêu cầu chờ duyệt.
        hop_dong = self.repo.get_hop_dong_hien_hanh(id_nhan_vien)
        # TODO: resize ảnh khi upload, xử lý ở module upload chung.
        return HoSoCaNhanResponse(
            thong_tin_chung=ThongTinChung(
                id_NhanVien=nhan_vien.id_NhanVien,
                hoTen=nhan_vien.hoTen,
                gioiTinh=nhan_vien.gioiTinh,
                ngaySinh=nhan_vien.ngaySinh,
                cccd=nhan_vien.cccd,
                maSoThue=nhan_vien.maSoThue,
                trangThaiLamViec=nhan_vien.trangThaiLamViec,
            ),
            lien_he=LienHe(email=nhan_vien.email, sdt=nhan_vien.sdt, diaChi=nhan_vien.diaChi),
            cong_viec=CongViec(chucVu=nhan_vien.chucVu),
            hop_dong=HopDongHienHanh(
                id_HopDong=hop_dong.id_HopDong,
                loaiHopDong=hop_dong.loaiHopDong,
                ngayBatDau=hop_dong.ngayBatDau,
                ngayKetThuc=hop_dong.ngayKetThuc,
                trangThaiHopDong=hop_dong.trangThaiHopDong,
                tepHopDong=hop_dong.tepHopDong,
            )
            if hop_dong
            else None,
        )
