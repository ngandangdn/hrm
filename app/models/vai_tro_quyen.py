from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.quyen import Quyen
    from app.models.vai_tro import VaiTro


# Bang goc VaiTro_Quyen: phan quyen cho vai tro. Tham chieu Bang 4.4, tr.94.
class VaiTroQuyen(SQLModel, table=True):
    __tablename__ = "VaiTro_Quyen"

    id_VaiTro: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("VaiTro.id_VaiTro"), primary_key=True)
    )
    id_Quyen: str = Field(
        sa_column=Column(NVARCHAR(50), ForeignKey("Quyen.id_Quyen"), primary_key=True)
    )

    vai_tro: "VaiTro" = Relationship(back_populates="vai_tro_quyen_list")
    quyen: "Quyen" = Relationship(back_populates="vai_tro_quyen_list")
