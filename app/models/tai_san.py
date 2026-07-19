from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date
from sqlalchemy.dialects.mysql import DECIMAL, NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.giao_nhan_tai_san import GiaoNhanTaiSan


# Bang goc TaiSan: danh muc tai san thiet bi. Tham chieu Bang 4.16, tr.99.
class TaiSan(SQLModel, table=True):
    __tablename__ = "TaiSan"

    id_TaiSan: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    tenTaiSan: str = Field(sa_column=Column(NVARCHAR(150), nullable=False))
    serialNumber: str | None = Field(default=None, sa_column=Column(NVARCHAR(100)))
    ngayMua: date | None = Field(default=None, sa_column=Column(Date))
    giaTri: Decimal | None = Field(default=None, sa_column=Column(DECIMAL(15, 2)))
    tinhTrang: str = Field(sa_column=Column(NVARCHAR(100), nullable=False))
    trangThai: int = Field(default=1, nullable=False)

    giao_nhan_tai_san_list: list["GiaoNhanTaiSan"] = Relationship(back_populates="tai_san")
