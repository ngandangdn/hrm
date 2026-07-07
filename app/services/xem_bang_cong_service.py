from decimal import Decimal

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.bang_cong import BangCong
from app.models.tai_khoan import TaiKhoan
from app.repositories.bang_cong_repo import BangCongRepository
from app.schemas.cham_cong_schema import BangCongViewItem
from app.services.cham_cong_scope import assert_can_access_employee


class XemBangCongService:
    def __init__(self, session: Session) -> None:
        self.repo = BangCongRepository(session)

    def get_bang_cong(
        self,
        current_user: TaiKhoan,
        thang: int,
        nam: int,
        id_nhan_vien: str | None,
    ) -> dict[str, object]:
        """Fetch attendance rows by month/year with IDOR protection and employee-type branching."""
        target_id = id_nhan_vien or current_user.id_TaiKhoan
        # BR20-1: nhân viên chỉ xem của mình; HCNS/Admin toàn công ty; quản lý cần scope B4.
        assert_can_access_employee(current_user, target_id)
        rows = self.repo.list_by_month(target_id, thang, nam)
        if not rows:
            return {"trangThaiKy": "Đang tổng hợp", "du_lieu": [], "message": "Chưa có dữ liệu cho kỳ đã chọn"}
        return {
            "trangThaiKy": self._period_status(rows),
            "du_lieu": [self._to_view_item(item) for item in rows],
        }

    def _period_status(self, rows: list[BangCong]) -> str:
        # BR20-3: map trạng thái kỳ từ BangCong.trangThai.
        if all(item.trangThai == 1 for item in rows):
            return "Đã chốt"
        return "Chờ chốt"

    def _to_view_item(self, item: BangCong) -> BangCongViewItem:
        hours = item.tongGioLogtimeThucTe or item.tongGioLogtime or Decimal("0")
        ngay_cong = (hours / Decimal("8")).quantize(Decimal("0.01"))
        # BR20-2: response rẽ nhánh theo loại nhân sự; TingOp có đi muộn, Redmine có logtime/dự án.
        if item.loaiHinhTinhCong == "tingop":
            return BangCongViewItem(
                id_BangCong=item.id_BangCong,
                id_NhanVien=item.id_NhanVien,
                tenBangCong=item.tenBangCong,
                loaiHinhTinhCong=item.loaiHinhTinhCong,
                trangThaiKy="Đã chốt" if item.trangThai == 1 else "Chờ chốt",
                tuNgay=item.tuNgay,
                denNgay=item.denNgay,
                tongGioLogtimeThucTe=item.tongGioLogtimeThucTe,
                ngayCongQuyDoi=ngay_cong,
                soLanDiMuon=item.soLanDiMuon,
            )
        return BangCongViewItem(
            id_BangCong=item.id_BangCong,
            id_NhanVien=item.id_NhanVien,
            tenBangCong=item.tenBangCong,
            loaiHinhTinhCong=item.loaiHinhTinhCong,
            trangThaiKy="Đã chốt" if item.trangThai == 1 else "Chờ chốt",
            tuNgay=item.tuNgay,
            denNgay=item.denNgay,
            tongGioLogtime=item.tongGioLogtime,
            tongGioLogtimeThucTe=item.tongGioLogtimeThucTe,
            ngayCongQuyDoi=ngay_cong,
            tenDuAn_Task=item.tenDuAn_Task,
        )
