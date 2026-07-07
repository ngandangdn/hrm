from sqlmodel import Session, select

from app.models.quy_phep import QuyPhep


class QuyPhepRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, id_quy_phep: str) -> QuyPhep | None:
        return self.session.get(QuyPhep, id_quy_phep)

    def get_by_employee_year(self, id_nhan_vien: str, nam: int) -> QuyPhep | None:
        statement = select(QuyPhep).where(
            QuyPhep.id_NhanVien == id_nhan_vien,
            QuyPhep.nam == nam,
        )
        return self.session.exec(statement).first()

    def list_by_year(self, nam: int, offset: int, limit: int) -> list[QuyPhep]:
        statement = select(QuyPhep).where(QuyPhep.nam == nam).offset(offset).limit(limit)
        return list(self.session.exec(statement).all())

    def save(self, quy_phep: QuyPhep, commit: bool = True) -> QuyPhep:
        self.session.add(quy_phep)
        if commit:
            self.session.commit()
            self.session.refresh(quy_phep)
        return quy_phep
