from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import DECIMAL, NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.don_giai_trinh_cong import DonGiaiTrinhCong
    from app.models.nhan_vien import NhanVien


# Bang goc BangCong: bang cham cong tong hop. Tham chieu Bang 4.13, tr.98.
class BangCong(SQLModel, table=True):
    __tablename__ = "BangCong"

    id_BangCong: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    id_NhanVien: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("NhanVien.id_NhanVien"), nullable=False)
    )
    tenBangCong: str = Field(sa_column=Column(NVARCHAR(150), nullable=False))
    loaiHinhTinhCong: str = Field(sa_column=Column(NVARCHAR(50), nullable=False))
    tongGioLogtime: Decimal | None = Field(default=None, sa_column=Column(DECIMAL(5, 2)))
    tongGioLogtimeThucTe: Decimal | None = Field(default=None, sa_column=Column(DECIMAL(5, 2)))
    tenDuAn_Task: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    soLanDiMuon: int | None = Field(default=0)
    tuNgay: date = Field(sa_column=Column(Date, nullable=False))
    denNgay: date = Field(sa_column=Column(Date, nullable=False))
    ngayCapNhat: datetime | None = Field(default=None, sa_column=Column(DateTime))
    trangThai: int = Field(default=0, nullable=False)

    nhan_vien: "NhanVien" = Relationship(back_populates="bang_cong_list")
    don_giai_trinh_cong_list: list["DonGiaiTrinhCong"] = Relationship(back_populates="bang_cong")
