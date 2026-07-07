from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.mysql import DECIMAL, NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.don_nghi_phep import DonNghiPhep
    from app.models.nhan_vien import NhanVien


# Bang goc QuyPhep: quy phep nam. Tham chieu Bang 4.11, tr.97.
class QuyPhep(SQLModel, table=True):
    __tablename__ = "QuyPhep"
    __table_args__ = (UniqueConstraint("id_NhanVien", "nam", name="UQ_NhanVien_Nam"),)

    id_QuyPhep: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    id_NhanVien: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )
    nam: int = Field(nullable=False)
    tongQuyPhep: Decimal = Field(sa_column=Column(DECIMAL(5, 1), nullable=False))
    soNgayDaDung: Decimal = Field(
        default=Decimal("0"), sa_column=Column(DECIMAL(5, 1), nullable=False, default=0)
    )
    soNgayChoDuyet: Decimal = Field(
        default=Decimal("0"), sa_column=Column(DECIMAL(5, 1), nullable=False, default=0)
    )
    ngayCapNhat: datetime = Field(sa_column=Column(DateTime, nullable=False))
    trangThai: int = Field(default=1, nullable=False)

    nhan_vien: "NhanVien" = Relationship(back_populates="quy_phep_list")
    don_nghi_phep_list: list["DonNghiPhep"] = Relationship(back_populates="quy_phep")
