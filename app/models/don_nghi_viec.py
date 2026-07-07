from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.nhan_vien import NhanVien
    from app.models.quyet_dinh_nghi_viec import QuyetDinhNghiViec


# Bang goc DonNghiViec: don xin thoi viec. Tham chieu Bang 4.9, tr.96.
class DonNghiViec(SQLModel, table=True):
    __tablename__ = "DonNghiViec"

    id_DonNghiViec: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    ngayTao: datetime = Field(sa_column=Column(DateTime, nullable=False))
    ngayLamViecCuoi: date = Field(sa_column=Column(Date, nullable=False))
    lyDoNghiViec: str = Field(sa_column=Column(NVARCHAR(255), nullable=False))
    noiDungBanGiao: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    trangThai: int = Field(default=0, nullable=False)
    ghiChu: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    id_NhanVien: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )

    nhan_vien: "NhanVien" = Relationship(back_populates="don_nghi_viec_list")
    quyet_dinh_nghi_viec: "QuyetDinhNghiViec | None" = Relationship(back_populates="don_nghi_viec")
