from typing import TYPE_CHECKING

from sqlalchemy import Column
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.tai_khoan import TaiKhoan
    from app.models.vai_tro_quyen import VaiTroQuyen


# Bang goc VaiTro: vai tro nguoi dung. Tham chieu Bang 4.1, tr.93.
class VaiTro(SQLModel, table=True):
    __tablename__ = "VaiTro"

    id_VaiTro: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    tenVaiTro: str = Field(sa_column=Column(NVARCHAR(150), nullable=False))
    moTa: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))

    tai_khoan_list: list["TaiKhoan"] = Relationship(back_populates="vai_tro")
    vai_tro_quyen_list: list["VaiTroQuyen"] = Relationship(back_populates="vai_tro")
