import json
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlmodel import Session

from app.core.rbac import ADMIN_ROLE_IDS, HCNS_ROLE_IDS
from app.models.tai_khoan import TaiKhoan
from app.repositories.ho_so_ca_nhan_repo import HoSoCaNhanRepository
from app.schemas.ho_so_ca_nhan_schema import (
    CongViec,
    HoSoCaNhanResponse,
    HoSoTaiLieuFile,
    HopDongHienHanh,
    LienHe,
    NhanVienHoSoListItem,
    ThongTinChung,
)

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
PROFILE_FILE_TYPES = {
    "thoi_viec": "Quyết định thôi việc/Chấm dứt Hợp đồng",
    "dieu_chuyen": "Quyết định điều chuyển",
    "khen_thuong_ky_luat": "Quyết định khen thưởng/Kỷ luật",
    "nang_luong": "Quyết định nâng lương/Điều chỉnh bậc lương",
}
ALLOWED_PROFILE_FILE_SUFFIXES = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".xlsx"}


class HoSoCaNhanService:
    def __init__(self, session: Session) -> None:
        self.repo = HoSoCaNhanRepository(session)

    def get_profile(self, id_nhan_vien: str, current_user: TaiKhoan) -> HoSoCaNhanResponse:
        """Fetch the approved employee profile and current contract for UC06 display tabs."""
        # BR06-1: nhân viên/CTV/TTS chỉ xem hồ sơ của chính mình, HCNS được xem toàn công ty.
        if current_user.id_VaiTro not in ADMIN_ROLE_IDS | HCNS_ROLE_IDS and current_user.id_TaiKhoan != id_nhan_vien:
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
            cong_viec=CongViec(
                chucVu=nhan_vien.chucVu,
                nganhNghe=nhan_vien.nganhNghe,
                trinhDoHocVan=nhan_vien.trinhDoHocVan,
                trinhDoChuyenMon=nhan_vien.trinhDoChuyenMon,
                truongDaoTao=nhan_vien.truongDaoTao,
                chuyenNganh=nhan_vien.chuyenNganh,
                namTotNghiep=nhan_vien.namTotNghiep,
                kyNangNghe=nhan_vien.kyNangNghe,
                chungChiNghe=nhan_vien.chungChiNghe,
                bacKyNangNghe=nhan_vien.bacKyNangNghe,
                ngoaiNgu=nhan_vien.ngoaiNgu,
                tinHoc=nhan_vien.tinHoc,
                kinhNghiemLamViec=nhan_vien.kinhNghiemLamViec,
            ),
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
            ho_so_tai_lieu=self._list_profile_files(id_nhan_vien),
        )

    def list_profiles(self, current_user: TaiKhoan) -> list[NhanVienHoSoListItem]:
        """List employee profiles visible to the current user for the HR profile sidebar."""
        if current_user.id_VaiTro in ADMIN_ROLE_IDS | HCNS_ROLE_IDS:
            rows = self.repo.list_nhan_vien()
        else:
            own = self.repo.get_nhan_vien(current_user.id_TaiKhoan)
            rows = [own] if own else []

        return [
            NhanVienHoSoListItem(
                id_NhanVien=item.id_NhanVien,
                hoTen=item.hoTen,
                email=item.email,
                sdt=item.sdt,
                gioiTinh=item.gioiTinh,
                ngaySinh=item.ngaySinh,
                cccd=item.cccd,
                maSoThue=item.maSoThue,
                diaChi=item.diaChi,
                chucVu=item.chucVu,
                nganhNghe=item.nganhNghe,
                trinhDoHocVan=item.trinhDoHocVan,
                trinhDoChuyenMon=item.trinhDoChuyenMon,
                truongDaoTao=item.truongDaoTao,
                chuyenNganh=item.chuyenNganh,
                namTotNghiep=item.namTotNghiep,
                kyNangNghe=item.kyNangNghe,
                chungChiNghe=item.chungChiNghe,
                bacKyNangNghe=item.bacKyNangNghe,
                ngoaiNgu=item.ngoaiNgu,
                tinHoc=item.tinHoc,
                kinhNghiemLamViec=item.kinhNghiemLamViec,
                trangThaiLamViec=item.trangThaiLamViec,
            )
            for item in rows
        ]

    async def upload_contract_file(self, id_nhan_vien: str, file: UploadFile, current_user: TaiKhoan) -> HoSoCaNhanResponse:
        """Attach a labor contract file to the employee's active contract, then return the refreshed profile."""
        if current_user.id_VaiTro not in ADMIN_ROLE_IDS | HCNS_ROLE_IDS:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Chỉ HCNS/Admin được cập nhật file hợp đồng")

        nhan_vien = self.repo.get_nhan_vien(id_nhan_vien)
        if nhan_vien is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy hồ sơ nhân viên")

        hop_dong = self.repo.get_hop_dong_hien_hanh(id_nhan_vien)
        if hop_dong is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Nhân viên chưa có hợp đồng hiện hành")

        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in {".pdf", ".doc", ".docx"}:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "File hợp đồng chỉ hỗ trợ PDF, DOC hoặc DOCX")

        upload_dir = UPLOAD_ROOT / "hopdong"
        upload_dir.mkdir(parents=True, exist_ok=True)
        filename = f"hop-dong-{id_nhan_vien.lower()}-{uuid4().hex[:8]}{suffix}"
        target = upload_dir / filename
        content = await file.read()
        if not content:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "File hợp đồng không được để trống")
        target.write_bytes(content)

        hop_dong.tepHopDong = f"/uploads/hopdong/{filename}"
        self.repo.save_hop_dong(hop_dong)
        return self.get_profile(id_nhan_vien, current_user)

    async def upload_profile_files(
        self,
        id_nhan_vien: str,
        loai_ho_so: str,
        files: list[UploadFile],
        current_user: TaiKhoan,
    ) -> HoSoCaNhanResponse:
        """Attach one or more employee profile decision files, then return the refreshed profile."""
        if current_user.id_VaiTro not in ADMIN_ROLE_IDS | HCNS_ROLE_IDS:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Chỉ HCNS/Admin được cập nhật file hồ sơ")

        if loai_ho_so not in PROFILE_FILE_TYPES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Loại hồ sơ không hợp lệ")

        nhan_vien = self.repo.get_nhan_vien(id_nhan_vien)
        if nhan_vien is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy hồ sơ nhân viên")

        if not files:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Vui lòng chọn ít nhất một file")

        upload_dir = UPLOAD_ROOT / "hoso" / id_nhan_vien
        upload_dir.mkdir(parents=True, exist_ok=True)
        manifest = self._read_profile_manifest(id_nhan_vien)

        for file in files:
            suffix = Path(file.filename or "").suffix.lower()
            if suffix not in ALLOWED_PROFILE_FILE_SUFFIXES:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    "File hồ sơ chỉ hỗ trợ PDF, DOC, DOCX, ảnh hoặc Excel",
                )
            content = await file.read()
            if not content:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "File hồ sơ không được để trống")

            file_id = uuid4().hex[:12]
            safe_name = f"{loai_ho_so}-{file_id}{suffix}"
            target = upload_dir / safe_name
            target.write_bytes(content)
            manifest.append(
                {
                    "id": file_id,
                    "loaiHoSo": loai_ho_so,
                    "tenLoaiHoSo": PROFILE_FILE_TYPES[loai_ho_so],
                    "tenFile": file.filename or safe_name,
                    "duongDan": f"/uploads/hoso/{id_nhan_vien}/{safe_name}",
                    "kichThuoc": len(content),
                    "thoiGianUpload": datetime.now().isoformat(timespec="seconds"),
                }
            )

        self._write_profile_manifest(id_nhan_vien, manifest)
        return self.get_profile(id_nhan_vien, current_user)

    def _profile_manifest_path(self, id_nhan_vien: str) -> Path:
        return UPLOAD_ROOT / "hoso" / id_nhan_vien / "manifest.json"

    def _read_profile_manifest(self, id_nhan_vien: str) -> list[dict[str, object]]:
        manifest_path = self._profile_manifest_path(id_nhan_vien)
        if not manifest_path.exists():
            return []
        return json.loads(manifest_path.read_text(encoding="utf-8"))

    def _write_profile_manifest(self, id_nhan_vien: str, rows: list[dict[str, object]]) -> None:
        manifest_path = self._profile_manifest_path(id_nhan_vien)
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

    def _list_profile_files(self, id_nhan_vien: str) -> list[HoSoTaiLieuFile]:
        return [HoSoTaiLieuFile(**item) for item in self._read_profile_manifest(id_nhan_vien)]
