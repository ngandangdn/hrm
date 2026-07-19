from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.danh_muc_schema import (
    LichHopCreate,
    LichHopXuLyRequest,
    PhongHopCreate,
    PhongHopUpdate,
    QuyenCreate,
    QuyenUpdate,
    QuyPhepCreate,
    QuyPhepUpdate,
    TaiSanCreate,
    TaiSanUpdate,
)
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


@router.get("/tai-san")
def list_tai_san(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).list_tai_san(page, size)
    return api_response(data=data, message="Lay danh sach tai san thanh cong")


@router.post("/tai-san")
def create_tai_san(
    payload: TaiSanCreate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).create_tai_san(payload)
    return api_response(data=data, message="Tao tai san thanh cong")


@router.put("/tai-san/{id_tai_san}")
def update_tai_san(
    id_tai_san: str,
    payload: TaiSanUpdate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).update_tai_san(id_tai_san, payload)
    return api_response(data=data, message="Cap nhat tai san thanh cong")


@router.delete("/tai-san/{id_tai_san}")
def delete_tai_san(
    id_tai_san: str,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).delete_tai_san(id_tai_san)
    return api_response(data=data, message="Xoa tai san thanh cong")


@router.post("/tai-san/import")
async def import_tai_san(
    file: UploadFile = File(...),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = await DanhMucService(session).import_tai_san(file)
    return api_response(data=data, message="Import tai san hoan tat")


@router.get("/tai-san/export")
def export_tai_san(
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return DanhMucService(session).export_tai_san()


@router.get("/quyen")
def list_quyen(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).list_quyen(page, size)
    return api_response(data=data, message="Lay danh sach quyen thanh cong")


@router.post("/quyen")
def create_quyen(
    payload: QuyenCreate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).create_quyen(payload)
    return api_response(data=data, message="Tao quyen thanh cong")


@router.put("/quyen/{id_quyen}")
def update_quyen(
    id_quyen: str,
    payload: QuyenUpdate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).update_quyen(id_quyen, payload)
    return api_response(data=data, message="Cap nhat quyen thanh cong")


@router.delete("/quyen/{id_quyen}")
def delete_quyen(
    id_quyen: str,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).delete_quyen(id_quyen)
    return api_response(data=data, message="Xoa quyen thanh cong")


@router.post("/quyen/import")
async def import_quyen(
    file: UploadFile = File(...),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = await DanhMucService(session).import_quyen(file)
    return api_response(data=data, message="Import quyen hoan tat")


@router.get("/quyen/export")
def export_quyen(
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return DanhMucService(session).export_quyen()


@router.get("/quy-phep")
def list_quy_phep(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).list_quy_phep(page, size)
    return api_response(data=data, message="Lay danh sach quy phep thanh cong")


@router.post("/quy-phep")
def create_quy_phep(
    payload: QuyPhepCreate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).create_quy_phep(payload)
    return api_response(data=data, message="Tao quy phep thanh cong")


@router.put("/quy-phep/{id_quy_phep}")
def update_quy_phep(
    id_quy_phep: str,
    payload: QuyPhepUpdate,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).update_quy_phep(id_quy_phep, payload)
    return api_response(data=data, message="Cap nhat quy phep thanh cong")


@router.delete("/quy-phep/{id_quy_phep}")
def delete_quy_phep(
    id_quy_phep: str,
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = DanhMucService(session).delete_quy_phep(id_quy_phep)
    return api_response(data=data, message="Xoa quy phep thanh cong")


@router.post("/quy-phep/import")
async def import_quy_phep(
    file: UploadFile = File(...),
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = await DanhMucService(session).import_quy_phep(file)
    return api_response(data=data, message="Import quy phep hoan tat")


@router.get("/quy-phep/export")
def export_quy_phep(
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return DanhMucService(session).export_quy_phep()


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
