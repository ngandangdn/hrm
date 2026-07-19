from typing import TYPE_CHECKING

from sqlalchemy import Column
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.lich_hop import LichHop


# Bang goc PhongHop: danh muc phong hop. Tham chieu Bang 4.18, tr.100.
class PhongHop(SQLModel, table=True):
    __tablename__ = "PhongHop"

    id_Phong: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    tenPhong: str = Field(sa_column=Column(NVARCHAR(150), nullable=False))
    sucChua: int = Field(nullable=False)
    trangThai: int = Field(default=1, nullable=False)
    moTa: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))

    lich_hop_list: list["LichHop"] = Relationship(back_populates="phong_hop")
