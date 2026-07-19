import logging
import random
import re
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.repositories.tai_khoan_repo import TaiKhoanRepository
from app.schemas.auth_schema import (
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    ResetPasswordRequest,
    VerifyOtpRequest,
)

logger = logging.getLogger(__name__)

FAILED_LOGIN_CACHE: dict[str, dict[str, object]] = {}
OTP_CACHE: dict[str, dict[str, object]] = {}
REVOKED_REFRESH_TOKENS: set[str] = set()


class AuthService:
    def __init__(self, session: Session) -> None:
        self.repo = TaiKhoanRepository(session)

    def login(self, payload: LoginRequest) -> LoginResponse:
        """Validate login input, verify password, enforce lockout, and issue JWTs."""
        if not payload.email or not payload.matKhau:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email và mật khẩu là bắt buộc")

        user = self.repo.get_by_email(payload.email)
        cache = FAILED_LOGIN_CACHE.get(payload.email)
        now = datetime.now(timezone.utc)
        if cache and cache.get("locked_until") and now < cache["locked_until"]:
            # BR01-2: sai mật khẩu 5 lần liên tiếp thì khóa tạm thời 15 phút.
            raise HTTPException(status.HTTP_423_LOCKED, "Tài khoản đang bị khóa tạm thời 15 phút")

        if user is None or not verify_password(payload.matKhau, user.matKhau):
            self._record_failed_login(payload.email)
            logger.info("audit_login email=%s status=failed", payload.email)
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Thông tin đăng nhập không đúng")

        if user.trangThai != 1:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Tài khoản đang bị khóa")

        FAILED_LOGIN_CACHE.pop(payload.email, None)
        logger.info("audit_login email=%s status=success", payload.email)
        # BR01-4: access token hết hạn sau 30 phút không thao tác theo cấu hình JWT B1.
        return LoginResponse(
            access_token=create_access_token(user.id_TaiKhoan, user.id_VaiTro),
            refresh_token=create_refresh_token(user.id_TaiKhoan, user.id_VaiTro),
            id_TaiKhoan=user.id_TaiKhoan,
            id_VaiTro=user.id_VaiTro,
        )

    def forgot_password(self, payload: ForgotPasswordRequest) -> dict[str, str]:
        """Create a 6-digit OTP for password reset and mock sending it by email."""
        user = self.repo.get_by_email(payload.email)
        if user is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy tài khoản")
        otp = f"{random.randint(0, 999999):06d}"
        # BR01-3: OTP hết hạn sau 5 phút và chỉ dùng được một lần.
        OTP_CACHE[payload.email] = {
            "otp": otp,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
            "used": False,
        }
        # TODO: tích hợp email provider thật để gửi OTP.
        logger.info("mock_send_otp email=%s otp=%s", payload.email, otp)
        return {"email": payload.email}

    def verify_otp(self, payload: VerifyOtpRequest) -> dict[str, bool]:
        """Validate reset OTP without changing the password."""
        self._assert_valid_otp(payload.email, payload.otp, mark_used=False)
        return {"valid": True}

    def reset_password(self, payload: ResetPasswordRequest) -> dict[str, str]:
        """Validate one-time OTP, check new password strength, and update password."""
        user = self.repo.get_by_email(payload.email)
        if user is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy tài khoản")
        self._assert_valid_otp(payload.email, payload.otp, mark_used=True)
        self._validate_password_strength(payload.matKhauMoi)
        user.matKhau = hash_password(payload.matKhauMoi)
        self.repo.save(user)
        return {"email": payload.email}

    def logout(self, refresh_token: str) -> dict[str, bool]:
        """Invalidate the current refresh token for later refresh-token checks."""
        REVOKED_REFRESH_TOKENS.add(refresh_token)
        return {"revoked": True}

    def _record_failed_login(self, email: str) -> None:
        cache = FAILED_LOGIN_CACHE.setdefault(email, {"count": 0, "locked_until": None})
        cache["count"] = int(cache["count"]) + 1
        if int(cache["count"]) >= 5:
            # BR01-2: sai mật khẩu 5 lần liên tiếp thì khóa tạm thời 15 phút.
            cache["locked_until"] = datetime.now(timezone.utc) + timedelta(minutes=15)

    def _assert_valid_otp(self, email: str, otp: str, mark_used: bool) -> None:
        cached = OTP_CACHE.get(email)
        now = datetime.now(timezone.utc)
        if not cached or cached["otp"] != otp:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "OTP không hợp lệ")
        # BR01-3: OTP hết hạn sau 5 phút và chỉ dùng được một lần.
        if cached["used"] or now > cached["expires_at"]:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "OTP đã hết hạn hoặc đã được sử dụng")
        if mark_used:
            cached["used"] = True

    def _validate_password_strength(self, password: str) -> None:
        # BR01-1: regex yêu cầu >=8 ký tự, có hoa, thường, số và ký tự đặc biệt.
        pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$"
        if not re.match(pattern, password):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            )
