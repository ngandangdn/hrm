from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.nhan_vien import NhanVien
    from app.models.quy_phep import QuyPhep


# Bang goc DonNghiPhep: don xin nghi phep. Tham chieu Bang 4.12, tr.97.
class DonNghiPhep(SQLModel, table=True):
    __tablename__ = "DonNghiPhep"

    id_DonPhep: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    loaiPhep: str = Field(sa_column=Column(NVARCHAR(100), nullable=False))
    ngayTao: datetime = Field(sa_column=Column(DateTime, nullable=False))
    tuNgay: date = Field(sa_column=Column(Date, nullable=False))
    denNgay: date = Field(sa_column=Column(Date, nullable=False))
    trangThai: int = Field(default=0, nullable=False)
    lyDoTuChoi: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    lyDo: str = Field(sa_column=Column(NVARCHAR(255), nullable=False))
    thoiGianDuyet: datetime | None = Field(default=None, sa_column=Column(DateTime))
    nguoiDuyet: str = Field(sa_column=Column(NVARCHAR(50), nullable=False))
    id_NhanVien: str | None = Field(
        default=None,
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien")),
    )
    id_QuyPhep: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("QuyPhep.id_QuyPhep"), nullable=False)
    )

    nhan_vien: "NhanVien | None" = Relationship(back_populates="don_nghi_phep_list")
    quy_phep: "QuyPhep" = Relationship(back_populates="don_nghi_phep_list")
