from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session
from starlette.responses import StreamingResponse

from app.core.database import get_session
from app.core.response import api_response
from app.core.security import get_current_user
from app.models.tai_khoan import TaiKhoan
from app.schemas.bao_cao_schema import BaoCaoFilter, LoaiBaoCao, XuatBaoCaoRequest
from app.services.bao_cao_service import BaoCaoService
from app.utils.xuat_bao_cao import export_excel, export_pdf

router = APIRouter(prefix="/api/bao-cao", tags=["Bao cao"])


@router.get("/danh-muc")
def danh_muc_bao_cao(
    _: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = BaoCaoService(session).danh_muc()
    return api_response(data=data, message="Lấy danh mục báo cáo thành công")


@router.get("/{loai}")
def xem_bao_cao(
    loai: LoaiBaoCao,
    filters: BaoCaoFilter = Depends(),
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    data = BaoCaoService(session).get_report(loai, filters, current_user)
    message = "Không có dữ liệu cho kỳ báo cáo này" if not data.co_du_lieu else "Lấy báo cáo thành công"
    return api_response(data=data, message=message)


@router.post("/{loai}/xuat")
def xuat_bao_cao(
    loai: LoaiBaoCao,
    payload: XuatBaoCaoRequest,
    current_user: TaiKhoan = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        filters = BaoCaoFilter(**payload.model_dump(exclude={"dinh_dang"}))
        report = BaoCaoService(session).get_report(loai, filters, current_user)
        if payload.dinh_dang == "excel":
            output = export_excel(report)
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            filename = f"bao_cao_{loai.value}.xlsx"
        else:
            output = export_pdf(report)
            media_type = "application/pdf"
            filename = f"bao_cao_{loai.value}.pdf"
        return StreamingResponse(
            output,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Xuất file thất bại, vui lòng thử lại sau",
        ) from exc
