from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, func
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.nhan_vien import NhanVien
    from app.models.vai_tro import VaiTro


# Bang goc TaiKhoan: tai khoan dang nhap. Tham chieu Bang 4.2, tr.93.
class TaiKhoan(SQLModel, table=True):
    __tablename__ = "TaiKhoan"

    id_TaiKhoan: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    email: str = Field(sa_column=Column(NVARCHAR(150), nullable=False, unique=True))
    matKhau: str = Field(sa_column=Column(NVARCHAR(255), nullable=False))
    trangThai: int = Field(default=1, nullable=False)
    ngayTao: datetime = Field(
        default=None,
        sa_column=Column(DateTime, nullable=False, server_default=func.now()),
    )
    id_VaiTro: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("VaiTro.id_VaiTro"), nullable=False)
    )

    vai_tro: "VaiTro" = Relationship(back_populates="tai_khoan_list")
    nhan_vien: "NhanVien | None" = Relationship(back_populates="tai_khoan")
