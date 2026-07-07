from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.bang_cong import BangCong
    from app.models.nhan_vien import NhanVien


# Bang goc DonGiaiTrinhCong: giai trinh, bo sung cong. Tham chieu Bang 4.14, tr.98.
class DonGiaiTrinhCong(SQLModel, table=True):
    __tablename__ = "DonGiaiTrinhCong"

    id_DonGiaiTrinh: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    ngayGiaiTrinh: date = Field(sa_column=Column(Date, nullable=False))
    ngayTao: datetime = Field(sa_column=Column(DateTime, nullable=False))
    trangThai: int = Field(default=0, nullable=False)
    lyDo: str = Field(sa_column=Column(NVARCHAR(255), nullable=False))
    lyDoTuChoi: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    thoiGianDuyet: datetime | None = Field(default=None, sa_column=Column(DateTime))
    nguoiDuyet: str = Field(sa_column=Column(NVARCHAR(50), nullable=False))
    id_NhanVien: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )
    id_BangCong: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("BangCong.id_BangCong"), nullable=False)
    )

    nhan_vien: "NhanVien" = Relationship(back_populates="don_giai_trinh_cong_list")
    bang_cong: "BangCong" = Relationship(back_populates="don_giai_trinh_cong_list")
