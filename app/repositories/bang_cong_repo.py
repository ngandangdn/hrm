from datetime import date

from sqlmodel import Session, select

from app.models.bang_cong import BangCong
from app.models.nhan_vien import NhanVien


class BangCongRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, id_bang_cong: str) -> BangCong | None:
        return self.session.get(BangCong, id_bang_cong)

    def get_nhan_vien(self, id_nhan_vien: str) -> NhanVien | None:
        return self.session.get(NhanVien, id_nhan_vien)

    def find_existing(
        self,
        id_nhan_vien: str,
        ten_bang_cong: str,
        tu_ngay: date,
        den_ngay: date,
    ) -> BangCong | None:
        statement = select(BangCong).where(
            BangCong.id_NhanVien == id_nhan_vien,
            BangCong.tenBangCong == ten_bang_cong,
            BangCong.tuNgay == tu_ngay,
            BangCong.denNgay == den_ngay,
        )
        return self.session.exec(statement).first()

    def save(self, bang_cong: BangCong) -> BangCong:
        self.session.add(bang_cong)
        self.session.commit()
        self.session.refresh(bang_cong)
        return bang_cong

    def list_all(self) -> list[BangCong]:
        return list(self.session.exec(select(BangCong)).all())

    def list_by_employee(self, id_nhan_vien: str) -> list[BangCong]:
        statement = select(BangCong).where(BangCong.id_NhanVien == id_nhan_vien)
        return list(self.session.exec(statement).all())

    def list_by_month(self, id_nhan_vien: str, thang: int, nam: int) -> list[BangCong]:
        statement = select(BangCong).where(BangCong.id_NhanVien == id_nhan_vien)
        rows = self.session.exec(statement).all()
        return [
            item
            for item in rows
            if (item.tuNgay.month == thang and item.tuNgay.year == nam)
            or (item.denNgay.month == thang and item.denNgay.year == nam)
        ]

    def find_period_for_date(self, id_nhan_vien: str, ngay: date) -> BangCong | None:
        statement = select(BangCong).where(BangCong.id_NhanVien == id_nhan_vien)
        for item in self.session.exec(statement).all():
            if item.tuNgay <= ngay <= item.denNgay:
                return item
        return None
