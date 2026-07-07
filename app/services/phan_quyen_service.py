from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.rbac import ADMIN_ROLE_IDS
from app.models.tai_khoan import TaiKhoan
from app.repositories.phan_quyen_repo import PhanQuyenRepository


class PhanQuyenService:
    def __init__(self, session: Session) -> None:
        self.repo = PhanQuyenRepository(session)

    def get_roles_for_employee(self, id_nhan_vien: str) -> dict[str, object]:
        """Return all available roles and the role currently assigned to the employee."""
        tai_khoan = self._get_account(id_nhan_vien)
        return {
            "vai_tro_he_thong": self.repo.list_vai_tro(),
            "vai_tro_da_gan": [tai_khoan.id_VaiTro],
        }

    def assign_roles(self, id_nhan_vien: str, id_vai_tro_list: list[str]) -> TaiKhoan:
        """Assign the requested role to an employee account using the B1 schema."""
        # BR04-2: DB B1 chỉ có TaiKhoan.id_VaiTro, nên batch này không tự thêm bảng nhiều-vai-trò.
        if len(id_vai_tro_list) != 1:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "CSDL hiện chỉ hỗ trợ một vai trò trực tiếp cho mỗi tài khoản",
            )
        tai_khoan = self._get_account(id_nhan_vien)
        new_role_id = id_vai_tro_list[0]
        if self.repo.get_vai_tro(new_role_id) is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Vai trò không tồn tại")

        removing_admin = tai_khoan.id_VaiTro in ADMIN_ROLE_IDS and new_role_id not in ADMIN_ROLE_IDS
        if removing_admin:
            # BR04-4: không cho gỡ Admin nếu đây là Admin active cuối cùng.
            if self.repo.count_active_admins(ADMIN_ROLE_IDS) <= 1:
                raise HTTPException(status.HTTP_409_CONFLICT, "Không được gỡ vai trò Admin cuối cùng")

        # BR04-3: quyền mới có hiệu lực ngay vì mỗi request đọc vai trò mới nhất từ DB.
        tai_khoan.id_VaiTro = new_role_id
        return self.repo.save_tai_khoan(tai_khoan)

    def copy_roles(self, id_nhan_vien: str, id_nhan_vien_mau: str) -> TaiKhoan:
        """Copy the current role from a sample employee account to another account."""
        source = self._get_account(id_nhan_vien_mau)
        return self.assign_roles(id_nhan_vien, [source.id_VaiTro])

    def revoke_all_roles(self, id_nhan_vien: str) -> TaiKhoan:
        """Deactivate account permissions for B3 resignation flow reuse."""
        tai_khoan = self._get_account(id_nhan_vien)
        # BR04-5: khi tài khoản nghỉ việc thì thu hồi quyền bằng trạng thái khóa.
        tai_khoan.trangThai = 0
        return self.repo.save_tai_khoan(tai_khoan)

    def _get_account(self, id_nhan_vien: str) -> TaiKhoan:
        tai_khoan = self.repo.get_tai_khoan(id_nhan_vien)
        if tai_khoan is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy tài khoản nhân viên")
        return tai_khoan
