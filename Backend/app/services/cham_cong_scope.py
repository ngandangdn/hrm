from fastapi import HTTPException, status

from app.core.rbac import ADMIN_ROLE_IDS, HCNS_ROLE_IDS
from app.models.tai_khoan import TaiKhoan

MANAGER_ROLE_IDS = {"MANAGER", "Manager", "QUAN_LY", "QuanLy"}


def is_hcns_or_admin(user: TaiKhoan) -> bool:
    return user.id_VaiTro in (ADMIN_ROLE_IDS | HCNS_ROLE_IDS)


def assert_can_access_employee(user: TaiKhoan, id_nhan_vien: str) -> None:
    if is_hcns_or_admin(user):
        return
    if user.id_TaiKhoan == id_nhan_vien:
        return
    # BR19-1/BR20-1: chưa có bảng phạm vi quản lý từ B4, nên không tự suy diễn quyền xem người khác.
    raise HTTPException(
        status.HTTP_403_FORBIDDEN,
        "Chưa có cấu hình phạm vi quản lý để truy cập bảng công của nhân viên này",
    )
