from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.rbac import require_hcns_or_admin
from app.core.response import api_response
from app.models.tai_khoan import TaiKhoan
from app.schemas.phan_quyen_schema import GanVaiTroRequest
from app.services.phan_quyen_service import PhanQuyenService

router = APIRouter(prefix="/api/phan-quyen", tags=["Phan quyen"])


@router.get("/{id_nhan_vien}")
def get_roles(
    id_nhan_vien: str,
    _: TaiKhoan = Depends(require_hcns_or_admin),
    session: Session = Depends(get_session),
):
    # BR04-1: chỉ HCNS quản lý hoặc Admin được truy cập phân quyền.
    data = PhanQuyenService(session).get_roles_for_employee(id_nhan_vien)
    return api_response(data=data, message="Lấy phân quyền thành công")


@router.put("/{id_nhan_vien}")
def assign_roles(
    id_nhan_vien: str,
    payload: GanVaiTroRequest,
    _: TaiKhoan = Depends(require_hcns_or_admin),
    session: Session = Depends(get_session),
):
    # BR04-1: chỉ HCNS quản lý hoặc Admin được cập nhật phân quyền.
    data = PhanQuyenService(session).assign_roles(id_nhan_vien, payload.id_VaiTro_list)
    return api_response(data=data, message="Cập nhật phân quyền thành công")


@router.post("/{id_nhan_vien}/sao-chep/{id_nhan_vien_mau}")
def copy_roles(
    id_nhan_vien: str,
    id_nhan_vien_mau: str,
    _: TaiKhoan = Depends(require_hcns_or_admin),
    session: Session = Depends(get_session),
):
    # BR04-1: chỉ HCNS quản lý hoặc Admin được sao chép phân quyền.
    data = PhanQuyenService(session).copy_roles(id_nhan_vien, id_nhan_vien_mau)
    return api_response(data=data, message="Sao chép phân quyền thành công")
