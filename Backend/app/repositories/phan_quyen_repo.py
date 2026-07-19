from sqlmodel import Session, select

from app.models.tai_khoan import TaiKhoan
from app.models.vai_tro import VaiTro


class PhanQuyenRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_tai_khoan(self, id_nhan_vien: str) -> TaiKhoan | None:
        return self.session.get(TaiKhoan, id_nhan_vien)

    def list_vai_tro(self) -> list[VaiTro]:
        return list(self.session.exec(select(VaiTro)).all())

    def get_vai_tro(self, id_vai_tro: str) -> VaiTro | None:
        return self.session.get(VaiTro, id_vai_tro)

    def count_active_admins(self, admin_role_ids: set[str]) -> int:
        statement = select(TaiKhoan).where(
            TaiKhoan.trangThai == 1,
            TaiKhoan.id_VaiTro.in_(admin_role_ids),
        )
        return len(self.session.exec(statement).all())

    def save_tai_khoan(self, tai_khoan: TaiKhoan) -> TaiKhoan:
        self.session.add(tai_khoan)
        self.session.commit()
        self.session.refresh(tai_khoan)
        return tai_khoan
