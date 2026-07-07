from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.nhan_vien import NhanVien
    from app.models.tai_san import TaiSan


# Bang goc GiaoNhanTaiSan: lich su cap phat, thu hoi tai san. Tham chieu Bang 4.17, tr.99.
class GiaoNhanTaiSan(SQLModel, table=True):
    __tablename__ = "GiaoNhanTaiSan"

    id_GiaoNhan: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    ngayCapPhat: datetime = Field(sa_column=Column(DateTime, nullable=False))
    tinhTrangBanGiao: str = Field(sa_column=Column(NVARCHAR(100), nullable=False))
    tinhTrangThuHoi: str | None = Field(default=None, sa_column=Column(NVARCHAR(100)))
    tepBienBan: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    ngayThuHoi: datetime | None = Field(default=None, sa_column=Column(DateTime))
    trangThai: int = Field(default=1, nullable=False)
    id_TaiSan: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("TaiSan.id_TaiSan"), nullable=False)
    )
    id_NhanVien: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )

    tai_san: "TaiSan" = Relationship(back_populates="giao_nhan_tai_san_list")
    nhan_vien: "NhanVien" = Relationship(back_populates="giao_nhan_tai_san_list")
