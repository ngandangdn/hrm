from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlmodel import Session

from app.core.database import get_session
from app.core.rbac import require_hcns
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.cham_cong_schema import (
    DongYGiaiTrinhRequest,
    GiaiTrinhCongCreate,
    ImportConfirmRequest,
    TuChoiGiaiTrinhRequest,
)
from app.services.duyet_bang_cong_service import DuyetBangCongService
from app.services.giai_trinh_cong_service import GiaiTrinhCongService
from app.services.import_cham_cong_service import ImportChamCongService
from app.services.xem_bang_cong_service import XemBangCongService

router = APIRouter(prefix="/api/cham-cong", tags=["Cham cong"])


@router.post("/import")
async def preview_import_cham_cong(
    nguon: str = Form(...),
    file: UploadFile = File(...),
    _: TaiKhoan = Depends(require_hcns),
    session: Session = Depends(get_session),
):
    data = await ImportChamCongService(session).preview_import(file, nguon)
    return api_response(data=data, message="Tạo preview import chấm công thành công")


@router.post("/import/xac-nhan")
def confirm_import_cham_cong(
    payload: ImportConfirmRequest,
    _: TaiKhoan = Depends(require_hcns),
    session: Session = Depends(get_session),
):
    data = ImportChamCongService(session).confirm_import(payload.preview_id)
    return api_response(data=data, message="Lưu dữ liệu chấm công thành công")


@router.post("/giai-trinh")
async def create_giai_trinh_cong(
    payload_json: str = Form(...),
    file: UploadFile | None = File(default=None),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    payload = GiaiTrinhCongCreate.model_validate_json(payload_json)
    data = await GiaiTrinhCongService(session).create(payload, current_user, file)
    return api_response(data=data, message="Tạo đơn giải trình công thành công")


@router.get("/duyet-bang-cong")
def list_duyet_bang_cong(
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DuyetBangCongService(session).list_for_approval(current_user)
    return api_response(data=data, message="Lấy dữ liệu duyệt bảng công thành công")


@router.post("/don-giai-trinh/{id_don}/dong-y")
def approve_giai_trinh(
    id_don: str,
    payload: DongYGiaiTrinhRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DuyetBangCongService(session).approve_explanation(id_don, payload, current_user)
    return api_response(data=data, message="Đồng ý đơn giải trình công thành công")


@router.post("/don-giai-trinh/{id_don}/tu-choi")
def reject_giai_trinh(
    id_don: str,
    payload: TuChoiGiaiTrinhRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DuyetBangCongService(session).reject_explanation(id_don, payload, current_user)
    return api_response(data=data, message="Từ chối đơn giải trình công thành công")


@router.post("/{id_bang_cong}/chot")
def finalize_bang_cong(
    id_bang_cong: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DuyetBangCongService(session).finalize_bang_cong(id_bang_cong, current_user)
    return api_response(data=data, message="Chốt bảng công thành công")


@router.get("/bang-cong")
def view_bang_cong(
    thang: int = Query(..., ge=1, le=12),
    nam: int = Query(..., ge=2000),
    id_nhan_vien: str | None = None,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = XemBangCongService(session).get_bang_cong(current_user, thang, nam, id_nhan_vien)
    return api_response(data=data, message="Lấy bảng công thành công")
