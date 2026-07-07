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


class HopDongHienHanh(BaseModel):
    id_HopDong: str
    loaiHopDong: str
    ngayBatDau: date
    ngayKetThuc: date | None
    trangThaiHopDong: int
    tepHopDong: str | None


class HoSoCaNhanResponse(BaseModel):
    thong_tin_chung: ThongTinChung
    lien_he: LienHe
    cong_viec: CongViec
    hop_dong: HopDongHienHanh | None
