from sqlmodel import Session, select

from app.models.chi_tiet_cap_nhat_ho_so import ChiTietCapNhatHoSo
from app.models.nhan_vien import NhanVien
from app.models.yeu_cau_cap_nhat_ho_so import YeuCauCapNhatHoSo


class YeuCauCapNhatRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_nhan_vien(self, id_nhan_vien: str) -> NhanVien | None:
        return self.session.get(NhanVien, id_nhan_vien)

    def has_pending_request(self, id_nhan_vien: str) -> bool:
        statement = select(YeuCauCapNhatHoSo).where(
            YeuCauCapNhatHoSo.id_NhanVien == id_nhan_vien,
            YeuCauCapNhatHoSo.trangThai == 0,
        )
        return self.session.exec(statement).first() is not None

    def create(
        self,
        request: YeuCauCapNhatHoSo,
        details: list[ChiTietCapNhatHoSo],
    ) -> YeuCauCapNhatHoSo:
        self.session.add(request)
        for detail in details:
            self.session.add(detail)
        self.session.commit()
        self.session.refresh(request)
        return request

    def get_by_id(self, id_yeu_cau: str) -> YeuCauCapNhatHoSo | None:
        return self.session.get(YeuCauCapNhatHoSo, id_yeu_cau)

    def list_details(self, id_yeu_cau: str) -> list[ChiTietCapNhatHoSo]:
        statement = select(ChiTietCapNhatHoSo).where(
            ChiTietCapNhatHoSo.id_YeuCau == id_yeu_cau
        )
        return list(self.session.exec(statement).all())

    def list_pending(self) -> list[YeuCauCapNhatHoSo]:
        statement = select(YeuCauCapNhatHoSo).where(YeuCauCapNhatHoSo.trangThai == 0)
        return list(self.session.exec(statement).all())

    def save(self, request: YeuCauCapNhatHoSo) -> YeuCauCapNhatHoSo:
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        return request

    def save_nhan_vien(self, nhan_vien: NhanVien) -> NhanVien:
        self.session.add(nhan_vien)
        self.session.commit()
        self.session.refresh(nhan_vien)
        return nhan_vien
