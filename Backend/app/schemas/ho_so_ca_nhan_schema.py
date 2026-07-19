from datetime import date

from pydantic import BaseModel


class ThongTinChung(BaseModel):
    id_NhanVien: str
    hoTen: str
    gioiTinh: str
    ngaySinh: date
    cccd: str
    maSoThue: str | None
    trangThaiLamViec: int


class LienHe(BaseModel):
    email: str
    sdt: str
    diaChi: str | None


class CongViec(BaseModel):
    chucVu: str
    nganhNghe: str | None = None
    trinhDoHocVan: str | None = None
    trinhDoChuyenMon: str | None = None
    truongDaoTao: str | None = None
    chuyenNganh: str | None = None
    namTotNghiep: int | None = None
    kyNangNghe: str | None = None
    chungChiNghe: str | None = None
    bacKyNangNghe: str | None = None
    ngoaiNgu: str | None = None
    tinHoc: str | None = None
    kinhNghiemLamViec: str | None = None


class HopDongHienHanh(BaseModel):
    id_HopDong: str
    loaiHopDong: str
    ngayBatDau: date
    ngayKetThuc: date | None
    trangThaiHopDong: int
    tepHopDong: str | None


class HoSoTaiLieuFile(BaseModel):
    id: str
    loaiHoSo: str
    tenLoaiHoSo: str
    tenFile: str
    duongDan: str
    kichThuoc: int
    thoiGianUpload: str


class HoSoCaNhanResponse(BaseModel):
    thong_tin_chung: ThongTinChung
    lien_he: LienHe
    cong_viec: CongViec
    hop_dong: HopDongHienHanh | None
    ho_so_tai_lieu: list[HoSoTaiLieuFile] = []


class NhanVienHoSoListItem(BaseModel):
    id_NhanVien: str
    hoTen: str
    email: str
    sdt: str
    gioiTinh: str
    ngaySinh: date
    cccd: str
    maSoThue: str | None
    diaChi: str | None
    chucVu: str
    nganhNghe: str | None = None
    trinhDoHocVan: str | None = None
    trinhDoChuyenMon: str | None = None
    truongDaoTao: str | None = None
    chuyenNganh: str | None = None
    namTotNghiep: int | None = None
    kyNangNghe: str | None = None
    chungChiNghe: str | None = None
    bacKyNangNghe: str | None = None
    ngoaiNgu: str | None = None
    tinHoc: str | None = None
    kinhNghiemLamViec: str | None = None
    trangThaiLamViec: int
