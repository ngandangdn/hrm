from sqlmodel import Session, select

from app.models.nhan_vien import NhanVien
from app.models.tai_san import TaiSan


class TaiSanRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, id_tai_san: str, for_update: bool = False) -> TaiSan | None:
        statement = select(TaiSan).where(TaiSan.id_TaiSan == id_tai_san)
        if for_update:
            statement = statement.with_for_update()
        return self.session.exec(statement).first()

    def get_nhan_vien(self, id_nhan_vien: str) -> NhanVien | None:
        return self.session.get(NhanVien, id_nhan_vien)

    def save(self, tai_san: TaiSan, commit: bool = True) -> TaiSan:
        self.session.add(tai_san)
        if commit:
            self.session.commit()
            self.session.refresh(tai_san)
        return tai_san
