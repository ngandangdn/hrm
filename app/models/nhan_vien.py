from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.bang_cong import BangCong
    from app.models.don_giai_trinh_cong import DonGiaiTrinhCong
    from app.models.don_nghi_phep import DonNghiPhep
    from app.models.don_nghi_viec import DonNghiViec
    from app.models.giao_nhan_tai_san import GiaoNhanTaiSan
    from app.models.hop_dong import HopDong
    from app.models.lich_hop import LichHop
    from app.models.quy_phep import QuyPhep
    from app.models.tai_khoan import TaiKhoan
    from app.models.thong_bao import ThongBao
    from app.models.yeu_cau_cap_nhat_ho_so import YeuCauCapNhatHoSo


# Bang goc NhanVien: ho so nhan vien. Tham chieu Bang 4.5, tr.94.
class NhanVien(SQLModel, table=True):
    __tablename__ = "NhanVien"

    id_NhanVien: str = Field(
        sa_column=Column(
            NVARCHAR(50), ForeignKey("TaiKhoan.id_TaiKhoan"), primary_key=True
        )
    )
    hoTen: str = Field(sa_column=Column(NVARCHAR(150), nullable=False))
    email: str = Field(sa_column=Column(NVARCHAR(150), nullable=False))
    sdt: str = Field(sa_column=Column(NVARCHAR(20), nullable=False))
    maSoThue: str | None = Field(default=None, sa_column=Column(NVARCHAR(50)))
    gioiTinh: str = Field(sa_column=Column(NVARCHAR(10), nullable=False))
    diaChi: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    ngaySinh: date = Field(sa_column=Column(Date, nullable=False))
    cccd: str = Field(sa_column=Column(NVARCHAR(20), nullable=False, unique=True))
    trangThaiLamViec: int = Field(default=1, nullable=False)
    chucVu: str = Field(sa_column=Column(NVARCHAR(100), nullable=False))
    nganhNghe: str | None = Field(default=None, sa_column=Column(NVARCHAR(150)))
    trinhDoHocVan: str | None = Field(default=None, sa_column=Column(NVARCHAR(100)))
    trinhDoChuyenMon: str | None = Field(default=None, sa_column=Column(NVARCHAR(150)))
    truongDaoTao: str | None = Field(default=None, sa_column=Column(NVARCHAR(150)))
    chuyenNganh: str | None = Field(default=None, sa_column=Column(NVARCHAR(150)))
    namTotNghiep: int | None = Field(default=None)
    kyNangNghe: str | None = Field(default=None, sa_column=Column(NVARCHAR(500)))
    chungChiNghe: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    bacKyNangNghe: str | None = Field(default=None, sa_column=Column(NVARCHAR(100)))
    ngoaiNgu: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    tinHoc: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    kinhNghiemLamViec: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))

    tai_khoan: "TaiKhoan" = Relationship(back_populates="nhan_vien")
    hop_dong_list: list["HopDong"] = Relationship(back_populates="nhan_vien")
    yeu_cau_cap_nhat_ho_so_list: list["YeuCauCapNhatHoSo"] = Relationship(back_populates="nhan_vien")
    don_nghi_viec_list: list["DonNghiViec"] = Relationship(back_populates="nhan_vien")
    quy_phep_list: list["QuyPhep"] = Relationship(back_populates="nhan_vien")
    don_nghi_phep_list: list["DonNghiPhep"] = Relationship(back_populates="nhan_vien")
    bang_cong_list: list["BangCong"] = Relationship(back_populates="nhan_vien")
    don_giai_trinh_cong_list: list["DonGiaiTrinhCong"] = Relationship(back_populates="nhan_vien")
    thong_bao_list: list["ThongBao"] = Relationship(back_populates="nguoi_nhan")
    giao_nhan_tai_san_list: list["GiaoNhanTaiSan"] = Relationship(back_populates="nhan_vien")
    lich_hop_list: list["LichHop"] = Relationship(back_populates="nhan_vien")
