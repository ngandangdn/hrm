from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.nhan_vien import NhanVien


# Bang goc ThongBao: thong bao noi bo. Tham chieu Bang 4.15, tr.99.
class ThongBao(SQLModel, table=True):
    __tablename__ = "ThongBao"

    id_ThongBao: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    id_NguoiNhan: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )
    tieuDe: str = Field(sa_column=Column(NVARCHAR(255), nullable=False))
    noiDung: str = Field(sa_column=Column(Text, nullable=False))
    loaiThongBao: str = Field(sa_column=Column(NVARCHAR(50), nullable=False))
    trangThaiDoc: int = Field(default=0, nullable=False)
    thoiGianGui: datetime = Field(sa_column=Column(DateTime, nullable=False))

    nguoi_nhan: "NhanVien" = Relationship(back_populates="thong_bao_list")
