from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    matKhau: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    id_TaiKhoan: str
    id_VaiTro: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    matKhauMoi: str


class LogoutRequest(BaseModel):
    refresh_token: str
