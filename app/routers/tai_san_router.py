from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.tai_san_schema import CapPhatRequest, ThuHoiRequest
from app.services.tai_san_service import TaiSanService

router = APIRouter(prefix="/api/tai-san", tags=["Tai san"])


@router.post("/cap-phat")
def cap_phat_tai_san(
    payload: CapPhatRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = TaiSanService(session).cap_phat(payload, current_user)
    return api_response(data=data, message="Cấp phát tài sản thành công")


@router.get("/{id_tai_san}/lich-su-luan-chuyen")
def lich_su_luan_chuyen(
    id_tai_san: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = TaiSanService(session).lich_su_luan_chuyen(id_tai_san, current_user)
    message = "Tài sản chưa từng luân chuyển" if not data else "Lấy lịch sử luân chuyển thành công"
    return api_response(data=data, message=message)


@router.post("/{id_tai_san}/thu-hoi")
def thu_hoi_tai_san(
    id_tai_san: str,
    payload: ThuHoiRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = TaiSanService(session).thu_hoi(id_tai_san, payload, current_user)
    return api_response(data=data, message="Thu hồi tài sản thành công")
