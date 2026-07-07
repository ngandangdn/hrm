"""Password hashing and JWT authentication helpers."""

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import get_session
from app.models.tai_khoan import TaiKhoan

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    """Hash a plain password with bcrypt before storing it."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain password against its stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def _create_token(
    *,
    id_TaiKhoan: str,
    id_VaiTro: str,
    expires_delta: timedelta,
    token_type: str,
) -> str:
    """Build a signed JWT with account, role, expiry, and token type claims."""
    expires_at = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": id_TaiKhoan,
        "id_TaiKhoan": id_TaiKhoan,
        "id_VaiTro": id_VaiTro,
        "type": token_type,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(id_TaiKhoan: str, id_VaiTro: str) -> str:
    """Create a short-lived access token for API authorization."""
    return _create_token(
        id_TaiKhoan=id_TaiKhoan,
        id_VaiTro=id_VaiTro,
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )


def create_refresh_token(id_TaiKhoan: str, id_VaiTro: str) -> str:
    """Create a long-lived refresh token used to request new access tokens."""
    return _create_token(
        id_TaiKhoan=id_TaiKhoan,
        id_VaiTro=id_VaiTro,
        expires_delta=timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT, raising 401 for expired or invalid tokens."""
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="TOKEN_EXPIRED",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="TOKEN_INVALID",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> TaiKhoan:
    """Resolve the authenticated TaiKhoan from the Bearer access token."""
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="TOKEN_TYPE_INVALID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    id_tai_khoan = payload.get("id_TaiKhoan")
    if not id_tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="TOKEN_MISSING_ACCOUNT",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.exec(
        select(TaiKhoan).where(TaiKhoan.id_TaiKhoan == id_tai_khoan)
    ).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="USER_NOT_FOUND",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.trangThai != 1:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="USER_INACTIVE",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
