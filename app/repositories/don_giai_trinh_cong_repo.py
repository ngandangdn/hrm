from datetime import date

from sqlmodel import Session, select

from app.models.don_giai_trinh_cong import DonGiaiTrinhCong


class DonGiaiTrinhCongRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, id_don: str) -> DonGiaiTrinhCong | None:
        return self.session.get(DonGiaiTrinhCong, id_don)

    def save(self, don: DonGiaiTrinhCong) -> DonGiaiTrinhCong:
        self.session.add(don)
        self.session.commit()
        self.session.refresh(don)
        return don

    def exists_active_for_day(self, id_nhan_vien: str, ngay: date) -> bool:
        statement = select(DonGiaiTrinhCong).where(
            DonGiaiTrinhCong.id_NhanVien == id_nhan_vien,
            DonGiaiTrinhCong.ngayGiaiTrinh == ngay,
            DonGiaiTrinhCong.trangThai.in_([0, 1]),
        )
        return self.session.exec(statement).first() is not None

    def list_pending_for_bang_cong(self, id_bang_cong: str) -> list[DonGiaiTrinhCong]:
        statement = select(DonGiaiTrinhCong).where(
            DonGiaiTrinhCong.id_BangCong == id_bang_cong,
            DonGiaiTrinhCong.trangThai == 0,
        )
        return list(self.session.exec(statement).all())

    def list_pending_all(self) -> list[DonGiaiTrinhCong]:
        return list(
            self.session.exec(
                select(DonGiaiTrinhCong).where(DonGiaiTrinhCong.trangThai == 0)
            ).all()
        )
