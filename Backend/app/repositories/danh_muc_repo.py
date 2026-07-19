from datetime import datetime
from typing import Generic, TypeVar

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, SQLModel, select

from app.models.lich_hop import LichHop
from app.models.nhan_vien import NhanVien
from app.models.phong_hop import PhongHop
from app.models.thanh_vien_lich_hop import ThanhVienLichHop

T = TypeVar("T", bound=SQLModel)


class GenericDanhMucRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get(self, object_id: str) -> T | None:
        return self.session.get(self.model, object_id)

    def list_paginated(self, page: int, size: int) -> list[T]:
        statement = select(self.model).offset((page - 1) * size).limit(size)
        return list(self.session.exec(statement).all())

    def list_all(self, limit: int = 10000) -> list[T]:
        return list(self.session.exec(select(self.model).limit(limit)).all())

    def create(self, item: T) -> T:
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item

    def save(self, item: T) -> T:
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item

    def delete(self, item: T) -> None:
        try:
            self.session.delete(item)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise


class PhongHopRepository(GenericDanhMucRepository[PhongHop]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, PhongHop)

    def has_lich_hop_reference(self, id_phong: str) -> bool:
        statement = select(LichHop).where(LichHop.id_Phong == id_phong).limit(1)
        return self.session.exec(statement).first() is not None


class LichHopRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_all(self) -> list[LichHop]:
        statement = select(LichHop).order_by(LichHop.thoiGianBatDau.desc())
        return list(self.session.exec(statement).all())

    def list_by_user(self, id_nhan_vien: str) -> list[LichHop]:
        statement = (
            select(LichHop)
            .where(LichHop.id_NhanVien == id_nhan_vien)
            .order_by(LichHop.thoiGianBatDau.desc())
        )
        return list(self.session.exec(statement).all())

    def list_conflicts(
        self,
        id_phong: str,
        start: datetime,
        end: datetime,
        exclude_id: str | None = None,
        statuses: set[int] | None = None,
    ) -> list[LichHop]:
        statement = select(LichHop).where(
            LichHop.id_Phong == id_phong,
            LichHop.thoiGianBatDau < end,
            LichHop.thoiGianKetThuc > start,
        )
        if statuses is None:
            statuses = {0, 1}
        statement = statement.where(LichHop.trangThai.in_(statuses))
        if exclude_id:
            statement = statement.where(LichHop.id_LichHop != exclude_id)
        return list(self.session.exec(statement).all())

    def check_conflict(self, id_phong: str, start: datetime, end: datetime, exclude_id: str | None = None) -> bool:
        return bool(self.list_conflicts(id_phong, start, end, exclude_id, statuses={0, 1}))

    def get(self, id_lich_hop: str) -> LichHop | None:
        return self.session.get(LichHop, id_lich_hop)

    def save(self, item: LichHop) -> LichHop:
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item

    def save_many(self, items: list[LichHop]) -> None:
        for item in items:
            self.session.add(item)
        self.session.commit()

    def replace_members(self, id_lich_hop: str, members: list[ThanhVienLichHop]) -> None:
        existing = self.session.exec(
            select(ThanhVienLichHop).where(ThanhVienLichHop.id_LichHop == id_lich_hop)
        ).all()
        for item in existing:
            self.session.delete(item)
        for item in members:
            self.session.add(item)
        self.session.commit()

    def list_members(self, id_lich_hop: str) -> list[ThanhVienLichHop]:
        statement = select(ThanhVienLichHop).where(ThanhVienLichHop.id_LichHop == id_lich_hop)
        return list(self.session.exec(statement).all())

    def list_members_by_meeting_ids(self, ids: list[str]) -> dict[str, list[ThanhVienLichHop]]:
        if not ids:
            return {}
        statement = select(ThanhVienLichHop).where(ThanhVienLichHop.id_LichHop.in_(ids))
        result: dict[str, list[ThanhVienLichHop]] = {}
        for item in self.session.exec(statement).all():
            result.setdefault(item.id_LichHop, []).append(item)
        return result

    def list_employee_options(self) -> list[NhanVien]:
        statement = select(NhanVien).where(NhanVien.trangThaiLamViec == 1).order_by(NhanVien.hoTen)
        return list(self.session.exec(statement).all())

    def employee_exists(self, id_nhan_vien: str) -> bool:
        return self.session.get(NhanVien, id_nhan_vien) is not None

    def delete(self, item: LichHop) -> None:
        self.session.delete(item)
        self.session.commit()
