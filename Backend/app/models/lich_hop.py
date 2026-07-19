from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.nhan_vien import NhanVien
    from app.models.phong_hop import PhongHop


# Bang goc LichHop: dat phong hop. Tham chieu Bang 4.19, tr.100.
class LichHop(SQLModel, table=True):
    __tablename__ = "LichHop"

    id_LichHop: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    id_NhanVien: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )
    tieuDe: str = Field(sa_column=Column(NVARCHAR(255), nullable=False))
    noiDung: str | None = Field(default=None, sa_column=Column(Text))
    thoiGianBatDau: datetime = Field(sa_column=Column(DateTime, nullable=False))
    thoiGianKetThuc: datetime = Field(sa_column=Column(DateTime, nullable=False))
    mucDoUuTien: str = Field(sa_column=Column(NVARCHAR(50), nullable=False))
    trangThai: int = Field(default=0, nullable=False)
    id_Phong: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("PhongHop.id_Phong"), nullable=False)
    )

    nhan_vien: "NhanVien" = Relationship(back_populates="lich_hop_list")
    phong_hop: "PhongHop" = Relationship(back_populates="lich_hop_list")
