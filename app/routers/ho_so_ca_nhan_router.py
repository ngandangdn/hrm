from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.services.ho_so_ca_nhan_service import HoSoCaNhanService

router = APIRouter(prefix="/api/ho-so-ca-nhan", tags=["Ho so ca nhan"])


@router.get("/{id_nhan_vien}")
def get_ho_so_ca_nhan(
    id_nhan_vien: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = HoSoCaNhanService(session).get_profile(id_nhan_vien, current_user)
    return api_response(data=data, message="Lấy hồ sơ cá nhân thành công")
