from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.rbac import require_hcns_or_admin
from app.core.response import api_response
from app.models.tai_khoan import TaiKhoan
from app.schemas.phe_duyet_schema import PheDuyetRequest, TuChoiRequest
from app.services.phe_duyet_service import PheDuyetService

router = APIRouter(prefix="/api/phe-duyet", tags=["Phe duyet"])


@router.get("/yeu-cau-cap-nhat")
def list_pending_requests(
    _: TaiKhoan = Depends(require_hcns_or_admin),
    session: Session = Depends(get_session),
):
    # BR03-2: chỉ HCNS/Admin được xem danh sách phê duyệt.
    data = PheDuyetService(session).list_pending()
    return api_response(data=data, message="Lấy danh sách chờ phê duyệt thành công")


@router.post("/yeu-cau-cap-nhat/{id_yeu_cau}/duyet")
def approve_request(
    id_yeu_cau: str,
    _: PheDuyetRequest,
    current_user: TaiKhoan = Depends(require_hcns_or_admin),
    session: Session = Depends(get_session),
):
    # BR03-2: chỉ HCNS/Admin được phê duyệt yêu cầu.
    data = PheDuyetService(session).approve(id_yeu_cau, current_user)
    return api_response(data=data, message="Phê duyệt yêu cầu thành công")


@router.post("/yeu-cau-cap-nhat/{id_yeu_cau}/tu-choi")
def reject_request(
    id_yeu_cau: str,
    payload: TuChoiRequest,
    current_user: TaiKhoan = Depends(require_hcns_or_admin),
    session: Session = Depends(get_session),
):
    # BR03-2: chỉ HCNS/Admin được từ chối yêu cầu.
    data = PheDuyetService(session).reject(id_yeu_cau, payload, current_user)
    return api_response(data=data, message="Từ chối yêu cầu thành công")
