from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.schemas.auth_schema import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    ResetPasswordRequest,
    VerifyOtpRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login")
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    data = AuthService(session).login(payload)
    return api_response(data=data, message="Đăng nhập thành công")


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, session: Session = Depends(get_session)):
    data = AuthService(session).forgot_password(payload)
    return api_response(data=data, message="Đã tạo OTP khôi phục mật khẩu")


@router.post("/verify-otp")
def verify_otp(payload: VerifyOtpRequest, session: Session = Depends(get_session)):
    data = AuthService(session).verify_otp(payload)
    return api_response(data=data, message="OTP hợp lệ")


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, session: Session = Depends(get_session)):
    data = AuthService(session).reset_password(payload)
    return api_response(data=data, message="Đổi mật khẩu thành công")


@router.post("/logout")
def logout(payload: LogoutRequest, session: Session = Depends(get_session)):
    data = AuthService(session).logout(payload.refresh_token)
    return api_response(data=data, message="Đăng xuất thành công")
