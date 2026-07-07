from sqlmodel import Session, select

from app.models.nhan_vien import NhanVien
from app.models.thong_bao import ThongBao


class ThongBaoRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_by_receiver(self, id_nguoi_nhan: str, offset: int, limit: int) -> list[ThongBao]:
        statement = (
            select(ThongBao)
            .where(ThongBao.id_NguoiNhan == id_nguoi_nhan)
            .order_by(ThongBao.thoiGianGui.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get(self, id_thong_bao: str) -> ThongBao | None:
        return self.session.get(ThongBao, id_thong_bao)

    def count_unread(self, id_nguoi_nhan: str) -> int:
        statement = select(ThongBao).where(
            ThongBao.id_NguoiNhan == id_nguoi_nhan,
            ThongBao.trangThaiDoc == 0,
        )
        return len(self.session.exec(statement).all())

    def list_unread_by_receiver(self, id_nguoi_nhan: str) -> list[ThongBao]:
        statement = select(ThongBao).where(
            ThongBao.id_NguoiNhan == id_nguoi_nhan,
            ThongBao.trangThaiDoc == 0,
        )
        return list(self.session.exec(statement).all())

    def list_active_employee_ids(self) -> list[str]:
        statement = select(NhanVien).where(NhanVien.trangThaiLamViec == 1)
        return [item.id_NhanVien for item in self.session.exec(statement).all()]

    def employee_exists(self, id_nhan_vien: str) -> bool:
        return self.session.get(NhanVien, id_nhan_vien) is not None

    def save(self, thong_bao: ThongBao, commit: bool = True) -> ThongBao:
        self.session.add(thong_bao)
        if commit:
            self.session.commit()
            self.session.refresh(thong_bao)
        return thong_bao
