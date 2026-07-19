from sqlmodel import Session, select

from app.models.tai_khoan import TaiKhoan


class TaiKhoanRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_email(self, email: str) -> TaiKhoan | None:
        return self.session.exec(select(TaiKhoan).where(TaiKhoan.email == email)).first()

    def get_by_id(self, id_tai_khoan: str) -> TaiKhoan | None:
        return self.session.get(TaiKhoan, id_tai_khoan)

    def save(self, tai_khoan: TaiKhoan) -> TaiKhoan:
        self.session.add(tai_khoan)
        self.session.commit()
        self.session.refresh(tai_khoan)
        return tai_khoan
