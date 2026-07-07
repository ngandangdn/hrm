from io import BytesIO

from fastapi import HTTPException, UploadFile, status
from openpyxl import Workbook, load_workbook
from sqlmodel import Session
from starlette.responses import StreamingResponse

from app.models.phong_hop import PhongHop
from app.repositories.danh_muc_repo import PhongHopRepository
from app.schemas.danh_muc_schema import PhongHopCreate, PhongHopUpdate


class DanhMucService:
    def __init__(self, session: Session) -> None:
        self.phong_hop_repo = PhongHopRepository(session)

    def list_phong_hop(self, page: int = 1, size: int = 20) -> list[PhongHop]:
        """List PhongHop with default pagination for UC05."""
        return self.phong_hop_repo.list_paginated(page, size)

    def create_phong_hop(self, payload: PhongHopCreate) -> PhongHop:
        """Create a PhongHop after checking unique catalog code."""
        # BR05-1: mã danh mục là duy nhất và được kiểm tra trước khi tạo.
        if self.phong_hop_repo.get(payload.id_Phong):
            raise HTTPException(status.HTTP_409_CONFLICT, "Mã phòng họp đã tồn tại")
        return self.phong_hop_repo.create(PhongHop(**payload.model_dump()))

    def update_phong_hop(self, id_phong: str, payload: PhongHopUpdate) -> PhongHop:
        """Update editable PhongHop fields while preserving id_Phong."""
        phong = self._get_phong_hop(id_phong)
        data = payload.model_dump(exclude_unset=True)
        # BR05-1: mã danh mục id_Phong không được sửa sau khi tạo.
        data.pop("id_Phong", None)
        for key, value in data.items():
            setattr(phong, key, value)
        return self.phong_hop_repo.save(phong)

    def delete_phong_hop(self, id_phong: str) -> dict[str, str]:
        """Delete PhongHop only when it has no LichHop references."""
        phong = self._get_phong_hop(id_phong)
        # BR05-2: không xóa cứng bản ghi đang có FK tham chiếu.
        if self.phong_hop_repo.has_lich_hop_reference(id_phong):
            phong.trangThai = 0
            self.phong_hop_repo.save(phong)
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Phòng họp đang được tham chiếu, đã chuyển sang trạng thái ngừng hoạt động",
            )
        self.phong_hop_repo.delete(phong)
        return {"id_Phong": id_phong}

    async def import_phong_hop(self, file: UploadFile) -> dict[str, object]:
        """Import PhongHop rows from an .xlsx file and return row-level results."""
        if not file.filename or not file.filename.lower().endswith(".xlsx"):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Chỉ hỗ trợ file Excel .xlsx")
        workbook = load_workbook(BytesIO(await file.read()))
        sheet = workbook.active
        rows = list(sheet.iter_rows(min_row=2, values_only=True))
        errors: list[dict[str, object]] = []
        success = 0
        for index, row in enumerate(rows, start=2):
            try:
                payload = PhongHopCreate(
                    id_Phong=str(row[0]),
                    tenPhong=str(row[1]),
                    sucChua=int(row[2]),
                    trangThai=int(row[3] if row[3] is not None else 1),
                    moTa=str(row[4]) if row[4] is not None else None,
                )
                self.create_phong_hop(payload)
                success += 1
            except Exception as exc:
                errors.append({"dong": index, "loi": str(exc)})
        return {
            "tong_dong": len(rows),
            "thanh_cong": success,
            "that_bai": len(errors),
            "chi_tiet_loi": errors,
        }

    def export_phong_hop(self) -> StreamingResponse:
        """Export up to 10,000 PhongHop rows to Excel."""
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "PhongHop"
        sheet.append(["id_Phong", "tenPhong", "sucChua", "trangThai", "moTa"])
        for item in self.phong_hop_repo.list_all(limit=10000):
            sheet.append([item.id_Phong, item.tenPhong, item.sucChua, item.trangThai, item.moTa])
        output = BytesIO()
        workbook.save(output)
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=phong_hop.xlsx"},
        )

    def _get_phong_hop(self, id_phong: str) -> PhongHop:
        phong = self.phong_hop_repo.get(id_phong)
        if phong is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy phòng họp")
        return phong
