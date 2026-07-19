from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class PhongHopCreate(BaseModel):
    id_Phong: str = Field(min_length=1, max_length=50)
    tenPhong: str = Field(min_length=1, max_length=150)
    sucChua: int = Field(gt=0)
    trangThai: int = 1
    moTa: str | None = Field(default=None, max_length=255)


class PhongHopUpdate(BaseModel):
    tenPhong: str | None = Field(default=None, min_length=1, max_length=150)
    sucChua: int | None = Field(default=None, gt=0)
    trangThai: int | None = None
    moTa: str | None = Field(default=None, max_length=255)


class TaiSanCreate(BaseModel):
    id_TaiSan: str = Field(min_length=1, max_length=50)
    tenTaiSan: str = Field(min_length=1, max_length=150)
    serialNumber: str | None = Field(default=None, max_length=100)
    ngayMua: date | None = None
    giaTri: Decimal | None = None
    tinhTrang: str = Field(min_length=1, max_length=100)
    trangThai: int = 1


class TaiSanUpdate(BaseModel):
    tenTaiSan: str | None = Field(default=None, min_length=1, max_length=150)
    serialNumber: str | None = Field(default=None, max_length=100)
    ngayMua: date | None = None
    giaTri: Decimal | None = None
    tinhTrang: str | None = Field(default=None, min_length=1, max_length=100)
    trangThai: int | None = None


class QuyenCreate(BaseModel):
    id_Quyen: str = Field(min_length=1, max_length=50)
    tenQuyen: str = Field(min_length=1, max_length=150)
    moTa: str | None = Field(default=None, max_length=255)
    hanhDong: str = Field(min_length=1, max_length=100)


class QuyenUpdate(BaseModel):
    tenQuyen: str | None = Field(default=None, min_length=1, max_length=150)
    moTa: str | None = Field(default=None, max_length=255)
    hanhDong: str | None = Field(default=None, min_length=1, max_length=100)


class QuyPhepCreate(BaseModel):
    id_QuyPhep: str = Field(min_length=1, max_length=50)
    id_NhanVien: str = Field(min_length=1, max_length=50)
    nam: int = Field(ge=2000, le=2100)
    tongQuyPhep: Decimal
    soNgayDaDung: Decimal = Decimal("0")
    soNgayChoDuyet: Decimal = Decimal("0")
    ngayCapNhat: datetime | None = None
    trangThai: int = 1


class QuyPhepUpdate(BaseModel):
    id_NhanVien: str | None = Field(default=None, min_length=1, max_length=50)
    nam: int | None = Field(default=None, ge=2000, le=2100)
    tongQuyPhep: Decimal | None = None
    soNgayDaDung: Decimal | None = None
    soNgayChoDuyet: Decimal | None = None
    ngayCapNhat: datetime | None = None
    trangThai: int | None = None


class LichHopCreate(BaseModel):
    id_Phong: str = Field(min_length=1, max_length=50)
    tieuDe: str = Field(min_length=1, max_length=255)
    noiDung: str | None = None
    thoiGianBatDau: datetime
    thoiGianKetThuc: datetime
    mucDoUuTien: str = Field(default="normal", max_length=50)
    id_NhanVienThamGia: list[str] = Field(default_factory=list)


class LichHopXuLyRequest(BaseModel):
    lyDo: str | None = Field(default=None, max_length=255)


class ThanhVienLichHopResponse(BaseModel):
    id_LichHop: str
    id_NhanVien: str
    vaiTroThamGia: str
    trangThaiThamGia: str


class NhanVienOptionResponse(BaseModel):
    id_NhanVien: str
    hoTen: str
    email: str
    chucVu: str


class LichHopResponse(BaseModel):
    id_LichHop: str
    id_NhanVien: str
    id_Phong: str
    tieuDe: str
    noiDung: str | None
    thoiGianBatDau: datetime
    thoiGianKetThuc: datetime
    mucDoUuTien: str
    trangThai: int
    thanhVien: list[ThanhVienLichHopResponse] = Field(default_factory=list)
