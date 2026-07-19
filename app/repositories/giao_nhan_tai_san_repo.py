from sqlmodel import Session, select

from app.models.giao_nhan_tai_san import GiaoNhanTaiSan


class GiaoNhanTaiSanRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def save(self, giao_nhan: GiaoNhanTaiSan, commit: bool = True) -> GiaoNhanTaiSan:
        self.session.add(giao_nhan)
        if commit:
            self.session.commit()
            self.session.refresh(giao_nhan)
        return giao_nhan

    def list_by_tai_san(self, id_tai_san: str) -> list[GiaoNhanTaiSan]:
        statement = (
            select(GiaoNhanTaiSan)
            .where(GiaoNhanTaiSan.id_TaiSan == id_tai_san)
            .order_by(GiaoNhanTaiSan.ngayCapPhat.desc())
        )
        return list(self.session.exec(statement).all())

    def list_by_nhan_vien(self, id_nhan_vien: str) -> list[GiaoNhanTaiSan]:
        statement = (
            select(GiaoNhanTaiSan)
            .where(
                GiaoNhanTaiSan.id_NhanVien == id_nhan_vien,
                GiaoNhanTaiSan.ngayThuHoi.is_(None)
            )
            .order_by(GiaoNhanTaiSan.ngayCapPhat.desc())
        )
        return list(self.session.exec(statement).all())

    def get_current_by_tai_san(self, id_tai_san: str, for_update: bool = False) -> GiaoNhanTaiSan | None:
        statement = select(GiaoNhanTaiSan).where(
            GiaoNhanTaiSan.id_TaiSan == id_tai_san,
            GiaoNhanTaiSan.trangThai == 1,
            GiaoNhanTaiSan.ngayThuHoi.is_(None),
        )
        if for_update:
            statement = statement.with_for_update()
        return self.session.exec(statement).first()
