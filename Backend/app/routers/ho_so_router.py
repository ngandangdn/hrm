from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.ho_so_schema import YeuCauCapNhatCreate
from app.services.yeu_cau_cap_nhat_service import YeuCauCapNhatService

router = APIRouter(prefix="/api/ho-so", tags=["Ho so"])


@router.post("/yeu-cau-cap-nhat")
async def create_yeu_cau_cap_nhat(
    payload_json: str = Form(...),
    file: UploadFile | None = File(default=None),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    payload = YeuCauCapNhatCreate.model_validate_json(payload_json)
    data = await YeuCauCapNhatService(session).create_request(payload, current_user, file)
    return api_response(data=data, message="Đã gửi yêu cầu cập nhật hồ sơ")


@router.get("/yeu-cau-cap-nhat/{id_yeu_cau}")
def get_yeu_cau_cap_nhat(
    id_yeu_cau: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = YeuCauCapNhatService(session).get_detail(id_yeu_cau, current_user)
    return api_response(data=data, message="Lấy chi tiết yêu cầu thành công")


@router.delete("/yeu-cau-cap-nhat/{id_yeu_cau}")
def cancel_yeu_cau_cap_nhat(
    id_yeu_cau: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = YeuCauCapNhatService(session).cancel_request(id_yeu_cau, current_user)
    return api_response(data=data, message="Đã hủy yêu cầu cập nhật")
