from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.chi_tiet_cap_nhat_ho_so import ChiTietCapNhatHoSo
    from app.models.nhan_vien import NhanVien


# Bang goc YeuCauCapNhatHoSo: yeu cau chinh sua thong tin. Tham chieu Bang 4.7, tr.95.
class YeuCauCapNhatHoSo(SQLModel, table=True):
    __tablename__ = "YeuCauCapNhatHoSo"

    id_YeuCau: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    ngayGui: datetime = Field(sa_column=Column(DateTime, nullable=False))
    trangThai: int = Field(default=0, nullable=False)
    nguoiDuyet: str = Field(sa_column=Column(NVARCHAR(50), nullable=False))
    thoiGianDuyet: datetime | None = Field(default=None, sa_column=Column(DateTime))
    ghiChu: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    id_NhanVien: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )

    nhan_vien: "NhanVien" = Relationship(back_populates="yeu_cau_cap_nhat_ho_so_list")
    chi_tiet_list: list["ChiTietCapNhatHoSo"] = Relationship(back_populates="yeu_cau")
