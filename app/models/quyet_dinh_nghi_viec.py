from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.don_nghi_viec import DonNghiViec


# Bang goc QuyetDinhNghiViec: quyet dinh thoi viec. Tham chieu Bang 4.10, tr.96.
class QuyetDinhNghiViec(SQLModel, table=True):
    __tablename__ = "QuyetDinhNghiViec"

    id_QuyetDinh: str = Field(sa_column=Column(NVARCHAR(50), primary_key=True))
    soQuyetDinh: str = Field(sa_column=Column(NVARCHAR(50), nullable=False))
    ngayKy: date = Field(sa_column=Column(Date, nullable=False))
    nguoiKy: str = Field(sa_column=Column(NVARCHAR(150), nullable=False))
    lyDoNghiViec: str = Field(sa_column=Column(NVARCHAR(255), nullable=False))
    tepQuyetDinh: str | None = Field(default=None, sa_column=Column(NVARCHAR(255)))
    id_DonNghiViec: str = Field(
        sa_column=Column(
            NVARCHAR(50),
            ForeignKey("DonNghiViec.id_DonNghiViec"),
            nullable=False,
            unique=True,
        )
    )

    don_nghi_viec: "DonNghiViec" = Relationship(back_populates="quyet_dinh_nghi_viec")
