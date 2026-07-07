from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.danh_muc_schema import PhongHopCreate, PhongHopUpdate
from app.services.danh_muc_service import DanhMucService

router = APIRouter(prefix="/api/danh-muc", tags=["Danh muc"])


@router.get("/phong-hop")
def list_phong_hop(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).list_phong_hop(page, size)
    return api_response(data=data, message="Lấy danh sách phòng họp thành công")


@router.post("/phong-hop")
def create_phong_hop(
    payload: PhongHopCreate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).create_phong_hop(payload)
    return api_response(data=data, message="Tạo phòng họp thành công")


@router.put("/phong-hop/{id_phong}")
def update_phong_hop(
    id_phong: str,
    payload: PhongHopUpdate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).update_phong_hop(id_phong, payload)
    return api_response(data=data, message="Cập nhật phòng họp thành công")


@router.delete("/phong-hop/{id_phong}")
def delete_phong_hop(
    id_phong: str,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).delete_phong_hop(id_phong)
    return api_response(data=data, message="Xóa phòng họp thành công")


@router.post("/phong-hop/import")
async def import_phong_hop(
    file: UploadFile = File(...),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = await DanhMucService(session).import_phong_hop(file)
    return api_response(data=data, message="Import phòng họp hoàn tất")


@router.get("/phong-hop/export")
def export_phong_hop(
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return DanhMucService(session).export_phong_hop()
