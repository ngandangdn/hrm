from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.mysql import NVARCHAR
from sqlmodel import Field, SQLModel


# Bang bo sung ThanhVienLichHop: danh sach thanh vien tham gia tung lich hop.
class ThanhVienLichHop(SQLModel, table=True):
    __tablename__ = "ThanhVienLichHop"

    id_LichHop: str = Field(
        sa_column=Column(
            NVARCHAR(50),
            ForeignKey("LichHop.id_LichHop"),
            primary_key=True,
        )
    )
    id_NhanVien: str = Field(
        sa_column=Column(
            NVARCHAR(50),
            ForeignKey("NhanVien.id_NhanVien"),
            primary_key=True,
        )
    )
    vaiTroThamGia: str = Field(default="tham_du", sa_column=Column(NVARCHAR(50), nullable=False))
    trangThaiThamGia: str = Field(default="cho_xac_nhan", sa_column=Column(NVARCHAR(50), nullable=False))
