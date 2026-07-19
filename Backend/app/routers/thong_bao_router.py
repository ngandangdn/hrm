from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.thong_bao_schema import ThongBaoCreate
from app.services.thong_bao_service import ThongBaoService

router = APIRouter(prefix="/api/thong-bao", tags=["Thong bao"])


@router.get("")
def list_thong_bao(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = ThongBaoService(session).list_notifications(current_user, page, size)
    message = "Không có thông báo nào" if not data else "Lấy danh sách thông báo thành công"
    return api_response(data=data, message=message)


@router.get("/dem-chua-doc")
def count_unread_thong_bao(
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = ThongBaoService(session).count_unread(current_user)
    return api_response(data=data, message="Lấy số lượng thông báo chưa đọc thành công")


@router.post("/{id_thong_bao}/danh-dau-da-doc")
def mark_read_thong_bao(
    id_thong_bao: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = ThongBaoService(session).mark_read(id_thong_bao, current_user)
    return api_response(data=data, message="Đánh dấu đã đọc thành công")


@router.post("/danh-dau-tat-ca-da-doc")
def mark_all_read_thong_bao(
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = ThongBaoService(session).mark_all_read(current_user)
    return api_response(data=data, message="Đánh dấu tất cả đã đọc thành công")


@router.post("")
def create_thong_bao(
    payload: ThongBaoCreate,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = ThongBaoService(session).create_notification(payload, current_user)
    return api_response(data=data, message="Gửi thông báo thành công")
