from typing import Generic, TypeVar

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, SQLModel, select

from app.models.lich_hop import LichHop
from app.models.phong_hop import PhongHop

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
