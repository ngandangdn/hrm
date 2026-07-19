from datetime import date

from sqlmodel import Session, select

from app.models.don_nghi_phep import DonNghiPhep


class DonNghiPhepRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, id_don: str) -> DonNghiPhep | None:
        return self.session.get(DonNghiPhep, id_don)

    def save(self, don: DonNghiPhep, commit: bool = True) -> DonNghiPhep:
        self.session.add(don)
        if commit:
            self.session.commit()
            self.session.refresh(don)
        return don

    def list_by_employee(
        self,
        id_nhan_vien: str,
        nam: int,
        thang: int | None,
        offset: int,
        limit: int,
    ) -> list[DonNghiPhep]:
        statement = select(DonNghiPhep).where(DonNghiPhep.id_NhanVien == id_nhan_vien)
        rows = self.session.exec(statement).all()
        filtered = [
            item
            for item in rows
            if item.tuNgay.year == nam and (thang is None or item.tuNgay.month == thang)
        ]
        # BR12-3/BR14-2: sắp xếp mới nhất lên đầu.
        return sorted(filtered, key=lambda item: item.ngayTao, reverse=True)[offset : offset + limit]

    def list_all(
        self,
        nam: int | None,
        trang_thai: int | None,
        tu_ngay: date | None,
        den_ngay: date | None,
        offset: int,
        limit: int,
    ) -> list[DonNghiPhep]:
        rows = list(self.session.exec(select(DonNghiPhep)).all())
        filtered = []
        for item in rows:
            if nam is not None and item.tuNgay.year != nam:
                continue
            if trang_thai is not None and item.trangThai != trang_thai:
                continue
            if tu_ngay is not None and item.tuNgay < tu_ngay:
                continue
            if den_ngay is not None and item.denNgay > den_ngay:
                continue
            filtered.append(item)
        return sorted(filtered, key=lambda item: item.ngayTao, reverse=True)[offset : offset + limit]
