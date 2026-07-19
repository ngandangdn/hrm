from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.rbac import require_hcns
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.nghi_viec_schema import DonNghiViecCreate, QuyetDinhNghiViecCreate
from app.services.nghi_viec_service import NghiViecService

router = APIRouter(prefix="/api/nghi-viec", tags=["Nghi viec"])


@router.get("/don")
def list_don_nghi_viec(
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiViecService(session).list_don(current_user)
    return api_response(data=data, message="Lấy danh sách đơn nghỉ việc thành công")


@router.post("/don")
def create_don_nghi_viec(
    payload: DonNghiViecCreate,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiViecService(session).create_don(payload, current_user.id_TaiKhoan)
    return api_response(data=data, message="Tạo đơn nghỉ việc thành công")


@router.post("/don/nhap")
def create_draft_don_nghi_viec(
    payload: DonNghiViecCreate,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiViecService(session).create_don(payload, current_user.id_TaiKhoan, is_draft=True)
    return api_response(data=data, message="Lưu nháp đơn nghỉ việc thành công")


@router.get("/don/{id_don}")
def get_don_nghi_viec(
    id_don: str,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiViecService(session).get_don(id_don)
    return api_response(data=data, message="Lấy chi tiết đơn nghỉ việc thành công")


@router.post("/quyet-dinh")
def create_quyet_dinh_nghi_viec(
    payload: QuyetDinhNghiViecCreate,
    _: TaiKhoan = Depends(require_hcns),
    session: Session = Depends(get_session),
):
    # BR10-1: chỉ vai trò HCNS được tạo/ban hành quyết định nghỉ việc.
    data = NghiViecService(session).create_quyet_dinh(payload)
    return api_response(data=data, message="Tạo quyết định nghỉ việc thành công")


@router.get("/quyet-dinh/{id_quyet_dinh}")
def get_quyet_dinh_nghi_viec(
    id_quyet_dinh: str,
    _: TaiKhoan = Depends(require_hcns),
    session: Session = Depends(get_session),
):
    data = NghiViecService(session).get_quyet_dinh(id_quyet_dinh)
    return api_response(data=data, message="Lấy chi tiết quyết định nghỉ việc thành công")
