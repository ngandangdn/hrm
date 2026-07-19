from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.danh_muc_schema import LichHopCreate, LichHopXuLyRequest, PhongHopCreate, PhongHopUpdate
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
    return api_response(data=data, message="Lay danh sach phong hop thanh cong")


@router.post("/phong-hop")
def create_phong_hop(
    payload: PhongHopCreate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).create_phong_hop(payload)
    return api_response(data=data, message="Tao phong hop thanh cong")


@router.put("/phong-hop/{id_phong}")
def update_phong_hop(
    id_phong: str,
    payload: PhongHopUpdate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).update_phong_hop(id_phong, payload)
    return api_response(data=data, message="Cap nhat phong hop thanh cong")


@router.delete("/phong-hop/{id_phong}")
def delete_phong_hop(
    id_phong: str,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).delete_phong_hop(id_phong)
    return api_response(data=data, message="Xoa phong hop thanh cong")


@router.post("/phong-hop/import")
async def import_phong_hop(
    file: UploadFile = File(...),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = await DanhMucService(session).import_phong_hop(file)
    return api_response(data=data, message="Import phong hop hoan tat")


@router.get("/phong-hop/export")
def export_phong_hop(
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return DanhMucService(session).export_phong_hop()


@router.get("/lich-hop")
def list_lich_hop(
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).list_lich_hop(current_user)
    return api_response(data=data, message="Lay danh sach lich hop thanh cong")


@router.get("/nhan-vien-options")
def list_nhan_vien_lich_hop_options(
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).list_nhan_vien_options()
    return api_response(data=data, message="Lay danh sach nhan vien thanh cong")


@router.post("/lich-hop")
def tao_lich_hop(
    payload: LichHopCreate,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).tao_lich_hop(payload, current_user)
    return api_response(data=data, message="Tao lich hop thanh cong")


@router.post("/lich-hop/{id_lich_hop}/duyet")
def duyet_lich_hop(
    id_lich_hop: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).duyet_lich_hop(id_lich_hop, current_user)
    return api_response(data=data, message="Duyệt lịch họp thành công")


@router.post("/lich-hop/{id_lich_hop}/tu-choi")
def tu_choi_lich_hop(
    id_lich_hop: str,
    payload: LichHopXuLyRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).tu_choi_lich_hop(id_lich_hop, payload, current_user)
    return api_response(data=data, message="Từ chối lịch họp thành công")


@router.post("/lich-hop/{id_lich_hop}/can-thiep")
def can_thiep_lich_hop(
    id_lich_hop: str,
    payload: LichHopXuLyRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).can_thiep_lich_hop(id_lich_hop, payload, current_user)
    return api_response(data=data, message="Can thiệp lịch họp thành công")


@router.delete("/lich-hop/{id_lich_hop}")
def huy_lich_hop(
    id_lich_hop: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).huy_lich_hop(id_lich_hop, current_user)
    return api_response(data=data, message="Huy lich hop thanh cong")
