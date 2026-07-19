from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.yeu_cau_cap_nhat_ho_so import YeuCauCapNhatHoSo


# Bang goc ChiTietCapNhatHoSo: chi tiet truong xin thay doi. Tham chieu Bang 4.8, tr.96.
class ChiTietCapNhatHoSo(SQLModel, table=True):
    __tablename__ = "ChiTietCapNhatHoSo"

    id_ChiTiet: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    id_YeuCau: str = Field(
        sa_column=Column(
            NVARCHAR(50),
            ForeignKey("YeuCauCapNhatHoSo.id_YeuCau"),
            nullable=False,
            unique=True,
        )
    )
    tenTruong: str = Field(sa_column=Column(NVARCHAR(100), nullable=False))
    nhomThongTin: str = Field(sa_column=Column(NVARCHAR(100), nullable=False))
    giaTriCu: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    giaTriMoi: str = Field(sa_column=Column(NVARCHAR(255), nullable=False))
    ghiChu: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))

    yeu_cau: "YeuCauCapNhatHoSo" = Relationship(back_populates="chi_tiet_list")
