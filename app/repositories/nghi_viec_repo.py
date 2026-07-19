from sqlmodel import Session, select

from app.models.don_nghi_viec import DonNghiViec
from app.models.hop_dong import HopDong
from app.models.nhan_vien import NhanVien
from app.models.quyet_dinh_nghi_viec import QuyetDinhNghiViec


class NghiViecRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_nhan_vien(self, id_nhan_vien: str) -> NhanVien | None:
        return self.session.get(NhanVien, id_nhan_vien)

    def save_nhan_vien(self, nhan_vien: NhanVien) -> NhanVien:
        self.session.add(nhan_vien)
        self.session.commit()
        self.session.refresh(nhan_vien)
        return nhan_vien

    def get_hop_dong_hien_hanh(self, id_nhan_vien: str) -> HopDong | None:
        statement = select(HopDong).where(
            HopDong.id_NhanVien == id_nhan_vien,
            HopDong.trangThaiHopDong == 1,
        )
        return self.session.exec(statement).first()

    def create_don(self, don: DonNghiViec) -> DonNghiViec:
        self.session.add(don)
        self.session.commit()
        self.session.refresh(don)
        return don

    def get_don(self, id_don: str) -> DonNghiViec | None:
        return self.session.get(DonNghiViec, id_don)

    def list_don(self, id_nhan_vien: str | None = None) -> list[DonNghiViec]:
        statement = select(DonNghiViec)
        if id_nhan_vien:
            statement = statement.where(DonNghiViec.id_NhanVien == id_nhan_vien)
        statement = statement.order_by(DonNghiViec.ngayTao.desc())
        return list(self.session.exec(statement).all())

    def get_quyet_dinh(self, id_quyet_dinh: str) -> QuyetDinhNghiViec | None:
        return self.session.get(QuyetDinhNghiViec, id_quyet_dinh)

    def exists_so_quyet_dinh(self, so_quyet_dinh: str) -> bool:
        statement = select(QuyetDinhNghiViec).where(
            QuyetDinhNghiViec.soQuyetDinh == so_quyet_dinh
        )
        return self.session.exec(statement).first() is not None

    def create_quyet_dinh(self, quyet_dinh: QuyetDinhNghiViec) -> QuyetDinhNghiViec:
        self.session.add(quyet_dinh)
        self.session.commit()
        self.session.refresh(quyet_dinh)
        return quyet_dinh
