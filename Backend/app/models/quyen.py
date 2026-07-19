from typing import TYPE_CHECKING

from sqlalchemy import Column
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.vai_tro_quyen import VaiTroQuyen


# Bang goc Quyen: danh muc quyen han. Tham chieu Bang 4.3, tr.94.
class Quyen(SQLModel, table=True):
    __tablename__ = "Quyen"

    id_Quyen: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    tenQuyen: str = Field(sa_column=Column(NVARCHAR(150), nullable=False))
    moTa: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    hanhDong: str = Field(sa_column=Column(NVARCHAR(100), nullable=False))

    vai_tro_quyen_list: list["VaiTroQuyen"] = Relationship(back_populates="quyen")
