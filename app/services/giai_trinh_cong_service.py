from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlmodel import Session

from app.models.don_giai_trinh_cong import DonGiaiTrinhCong
from app.models.tai_khoan import TaiKhoan
from app.repositories.bang_cong_repo import BangCongRepository
from app.repositories.don_giai_trinh_cong_repo import DonGiaiTrinhCongRepository
from app.schemas.cham_cong_schema import GiaiTrinhCongCreate

MAX_EVIDENCE_SIZE = 5 * 1024 * 1024


class GiaiTrinhCongService:
    def __init__(self, session: Session) -> None:
        self.bang_cong_repo = BangCongRepository(session)
        self.don_repo = DonGiaiTrinhCongRepository(session)

    async def create(
        self,
        payload: GiaiTrinhCongCreate,
        current_user: TaiKhoan,
        file: UploadFile | None,
    ) -> DonGiaiTrinhCong:
        """Create an attendance explanation request linked to the matching BangCong period."""
        nhan_vien = self.bang_cong_repo.get_nhan_vien(current_user.id_TaiKhoan)
        if nhan_vien is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy hồ sơ nhân viên")
        # BR21-1: chỉ nhân viên chính thức dùng TingOp được tạo đơn; CTV/TTS bị chặn.
        if any(keyword in nhan_vien.chucVu.lower() for keyword in ["ctv", "tts", "thực tập", "cong tac vien"]):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "CTV/TTS không được tạo đơn giải trình công")
        await self._validate_file(file)

        bang_cong = (
            self.bang_cong_repo.get(payload.id_BangCong)
            if payload.id_BangCong
            else self.bang_cong_repo.find_period_for_date(current_user.id_TaiKhoan, payload.ngayGiaiTrinh)
        )
        if bang_cong is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy bảng công cho ngày giải trình")
        if bang_cong.id_NhanVien != current_user.id_TaiKhoan:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Không được tạo đơn giải trình hộ người khác")
        # BR21-2: chỉ được tạo đơn cho kỳ hiện tại hoặc kỳ trước chưa chốt; kỳ đã chốt bị khóa sổ.
        if bang_cong.trangThai == 1:
            raise HTTPException(status.HTTP_409_CONFLICT, "Kỳ công đã chốt, không thể tạo đơn giải trình")
        if not (bang_cong.tuNgay <= payload.ngayGiaiTrinh <= bang_cong.denNgay):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Ngày giải trình không thuộc kỳ bảng công")
        if self.don_repo.exists_active_for_day(current_user.id_TaiKhoan, payload.ngayGiaiTrinh):
            raise HTTPException(status.HTTP_409_CONFLICT, "Đã tồn tại đơn giải trình cho ngày này")

        # BR21-3: đơn mặc định chờ duyệt và liên kết id_BangCong để UC19 xử lý.
        don = DonGiaiTrinhCong(
            id_DonGiaiTrinh=f"DGTC-{uuid4().hex[:12]}",
            ngayGiaiTrinh=payload.ngayGiaiTrinh,
            ngayTao=datetime.now(),
            trangThai=0,
            lyDo=payload.lyDo,
            nguoiDuyet="PENDING",
            id_NhanVien=current_user.id_TaiKhoan,
            id_BangCong=bang_cong.id_BangCong,
        )
        return self.don_repo.save(don)

    async def _validate_file(self, file: UploadFile | None) -> None:
        if file is None:
            return
        filename = file.filename or ""
        if not filename.lower().endswith((".jpg", ".png")):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Minh chứng chỉ chấp nhận .jpg hoặc .png")
        content = await file.read()
        if len(content) > MAX_EVIDENCE_SIZE:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Minh chứng vượt quá giới hạn 5MB")
        await file.seek(0)
