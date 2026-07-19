from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan

ADMIN_ROLE_IDS = {"ADMIN", "Admin", "admin"}
HCNS_ROLE_IDS = {"HCNS", "HR", "QuanLyHCNS", "MANAGER_HCNS"}


def require_roles(allowed_role_ids: set[str]) -> Callable[..., TaiKhoan]:
    def dependency(current_user: TaiKhoan = Depends(get_current_user)) -> TaiKhoan:
        if current_user.id_VaiTro not in allowed_role_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền thực hiện chức năng này",
            )
        return current_user

    return dependency


require_hcns_or_admin = require_roles(ADMIN_ROLE_IDS | HCNS_ROLE_IDS)
require_hcns = require_roles(HCNS_ROLE_IDS)
