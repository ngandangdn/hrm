from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.nhan_vien import NhanVien


# Bang goc HopDong: hop dong lao dong. Tham chieu Bang 4.6, tr.95.
class HopDong(SQLModel, table=True):
    __tablename__ = "HopDong"

    id_HopDong: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    loaiHopDong: str = Field(sa_column=Column(NVARCHAR(100), nullable=False))
    ngayBatDau: date = Field(sa_column=Column(Date, nullable=False))
    ngayKetThuc: date | None = Field(default=None, sa_column=Column(Date))
    trangThaiHopDong: int = Field(default=1, nullable=False)
    tepHopDong: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    id_NhanVien: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )

    nhan_vien: "NhanVien" = Relationship(back_populates="hop_dong_list")
