from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlmodel import Session

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.services.ho_so_ca_nhan_service import HoSoCaNhanService

router = APIRouter(prefix="/api/ho-so-ca-nhan", tags=["Ho so ca nhan"])


@router.get("")
def list_ho_so_ca_nhan(
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = HoSoCaNhanService(session).list_profiles(current_user)
    return api_response(data=data, message="Lấy danh sách hồ sơ nhân viên thành công")


@router.get("/{id_nhan_vien}")
def get_ho_so_ca_nhan(
    id_nhan_vien: str,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = HoSoCaNhanService(session).get_profile(id_nhan_vien, current_user)
    return api_response(data=data, message="Lấy hồ sơ cá nhân thành công")


@router.post("/{id_nhan_vien}/hop-dong/upload")
async def upload_file_hop_dong(
    id_nhan_vien: str,
    file: UploadFile = File(...),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = await HoSoCaNhanService(session).upload_contract_file(id_nhan_vien, file, current_user)
    return api_response(data=data, message="Cập nhật file hợp đồng thành công")


@router.post("/{id_nhan_vien}/ho-so/upload")
async def upload_file_ho_so(
    id_nhan_vien: str,
    loai_ho_so: str = Form(...),
    files: list[UploadFile] = File(...),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = await HoSoCaNhanService(session).upload_profile_files(id_nhan_vien, loai_ho_so, files, current_user)
    return api_response(data=data, message="Cập nhật file hồ sơ thành công")
