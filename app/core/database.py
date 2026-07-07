"""Database engine, sessions, and initialization helpers."""

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.DB_URL, echo=settings.ENVIRONMENT == "dev")


def get_session() -> Generator[Session, None, None]:
    """Yield a SQLModel session for FastAPI dependencies."""
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """Create database tables for local development.

    This is convenient in dev when the schema is small and disposable. In
    production, prefer migrations so schema changes are explicit and reviewable.
    """
    import app.models  # noqa: F401

    SQLModel.metadata.create_all(engine)
