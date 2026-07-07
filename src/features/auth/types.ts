export type LoginRequest = {
  email: string;
  matKhau: string;
};

export type LoginResponseData = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  id_TaiKhoan: string;
  id_VaiTro: string;
};

export type AuthUser = {
  id_TaiKhoan: string;
  id_VaiTro: string;
  email: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  matKhauMoi: string;
};
