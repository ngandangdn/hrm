from sqlmodel import Session, select

from app.models.hop_dong import HopDong
from app.models.nhan_vien import NhanVien


class HoSoCaNhanRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_nhan_vien(self, id_nhan_vien: str) -> NhanVien | None:
        return self.session.get(NhanVien, id_nhan_vien)

    def list_nhan_vien(self) -> list[NhanVien]:
        statement = select(NhanVien).order_by(NhanVien.id_NhanVien)
        return list(self.session.exec(statement).all())

    def get_hop_dong_hien_hanh(self, id_nhan_vien: str) -> HopDong | None:
        statement = select(HopDong).where(
            HopDong.id_NhanVien == id_nhan_vien,
            HopDong.trangThaiHopDong == 1,
        )
        return self.session.exec(statement).first()

    def save_hop_dong(self, hop_dong: HopDong) -> HopDong:
        self.session.add(hop_dong)
        self.session.commit()
        self.session.refresh(hop_dong)
        return hop_dong
