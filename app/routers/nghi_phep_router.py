from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.nghi_phep_schema import DonNghiPhepCreate, DuyetDonRequest, TuChoiDonRequest
from app.services.nghi_phep_service import NghiPhepService

router = APIRouter(prefix="/api/nghi-phep", tags=["Nghi phep"])


@router.get("/bang-phep")
def get_bang_phep(
    nam: int | None = None,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=10, le=20),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # BR11-4: mặc định hiển thị dữ liệu năm hiện tại nếu không truyền param.
    data = NghiPhepService(session).get_bang_phep(current_user, nam or datetime.now().year, page, size)
    return api_response(data=data, message="Lấy bảng phép thành công")


@router.get("/lich-su")
def get_lich_su_phep(
    id_nhan_vien: str | None = None,
    nam: int | None = None,
    thang: int | None = Query(default=None, ge=1, le=12),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=10, le=20),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # BR12-2: mặc định lọc theo năm dương lịch hiện tại.
    data = NghiPhepService(session).get_lich_su(
        current_user,
        id_nhan_vien,
        nam or datetime.now().year,
        thang,
        page,
        size,
    )
    return api_response(data=data, message="Lấy lịch sử nghỉ phép thành công")


@router.post("/don")
def create_don_nghi_phep(
    payload: DonNghiPhepCreate,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiPhepService(session).create_don(payload, current_user)
    return api_response(data=data, message="Tạo đơn nghỉ phép thành công")


@router.get("/danh-sach")
def list_don_nghi_phep(
    nam: int | None = None,
    trang_thai: int | None = None,
    tu_ngay: date | None = None,
    den_ngay: date | None = None,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=10, le=20),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiPhepService(session).list_don(
        current_user,
        nam,
        trang_thai,
        tu_ngay,
        den_ngay,
        page,
        size,
    )
    return api_response(data=data, message="Lấy danh sách đơn nghỉ phép thành công")


@router.get("/don/{id_don}")
def get_don_nghi_phep(
    id_don: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiPhepService(session).get_detail(id_don, current_user)
    return api_response(data=data, message="Lấy chi tiết đơn nghỉ phép thành công")


@router.post("/don/{id_don}/duyet")
def approve_don_nghi_phep(
    id_don: str,
    _: DuyetDonRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiPhepService(session).approve(id_don, current_user)
    return api_response(data=data, message="Duyệt đơn nghỉ phép thành công")


@router.post("/don/{id_don}/tu-choi")
def reject_don_nghi_phep(
    id_don: str,
    payload: TuChoiDonRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiPhepService(session).reject(id_don, payload, current_user)
    return api_response(data=data, message="Từ chối đơn nghỉ phép thành công")


@router.post("/don/{id_don}/huy")
def cancel_don_nghi_phep(
    id_don: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = NghiPhepService(session).cancel(id_don, current_user)
    return api_response(data=data, message="Hủy đơn nghỉ phép thành công")
