from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.rbac import ADMIN_ROLE_IDS, HCNS_ROLE_IDS
from app.models.tai_khoan import TaiKhoan
from app.repositories.bao_cao_repo import BaoCaoRepository
from app.schemas.bao_cao_schema import BaoCaoFilter, BaoCaoResponse, LoaiBaoCao

# Quyết định B9 đã chốt:
# - Không thêm phongBan/schema mới; tạm thời chỉ hỗ trợ lọc theo du_an từ BangCong.tenDuAn_Task.
# - Cấp cao xem toàn công ty: ADMIN/Admin/admin, HCNS/HR/QuanLyHCNS/MANAGER_HCNS.
# - Cấp trung: MANAGER/Manager/QUAN_LY/QuanLy. Vì DB chưa có scope quản lý-dự án, cấp trung bị chặn cho tới khi có cấu hình scope dự án rõ ràng.
SENIOR_REPORT_ROLE_IDS = ADMIN_ROLE_IDS | HCNS_ROLE_IDS
MIDDLE_REPORT_ROLE_IDS = {"MANAGER", "Manager", "QUAN_LY", "QuanLy"}


class BaoCaoService:
    def __init__(self, session: Session) -> None:
        self.repo = BaoCaoRepository(session)

    def danh_muc(self) -> list[dict[str, str]]:
        """UC24: return four fixed report categories for frontend menu rendering."""
        return [
            {"loai": "hanh-chinh", "ten": "Hành chính", "mo_ta": "Nhân sự, hợp đồng, nghỉ việc"},
            {"loai": "hieu-suat", "ten": "Hiệu suất", "mo_ta": "Giờ công, đi muộn, dự án"},
            {"loai": "tong-hop", "ten": "Tổng hợp", "mo_ta": "Dashboard tổng quan"},
            {"loai": "quan-tri", "ten": "Quản trị", "mo_ta": "Tài sản và phòng họp"},
        ]

    def get_report(
        self,
        loai: LoaiBaoCao,
        filters: BaoCaoFilter,
        current_user: TaiKhoan,
    ) -> BaoCaoResponse:
        """UC24: validate RBAC/scope, query real-time aggregates, and map chart/table data."""
        self._assert_can_view_report(current_user, filters)
        if filters.tu_ngay > filters.den_ngay:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Từ ngày phải nhỏ hơn hoặc bằng đến ngày")

        raw = self._query(loai, filters)
        rows = raw.get("rows", [])
        chart = self._to_chart(rows)
        return BaoCaoResponse(
            loai=loai,
            bo_loc=filters,
            bieu_do=chart,
            bang_bieu=rows,
            co_du_lieu=bool(rows),
        )

    def _query(self, loai: LoaiBaoCao, filters: BaoCaoFilter) -> dict:
        if loai == LoaiBaoCao.HANH_CHINH:
            return self.repo.bao_cao_hanh_chinh(filters)
        if loai == LoaiBaoCao.HIEU_SUAT:
            return self.repo.bao_cao_hieu_suat(filters)
        if loai == LoaiBaoCao.TONG_HOP:
            return self.repo.bao_cao_tong_hop(filters)
        if loai == LoaiBaoCao.QUAN_TRI:
            return self.repo.bao_cao_quan_tri(filters)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Loại báo cáo không hợp lệ")

    def _assert_can_view_report(self, current_user: TaiKhoan, filters: BaoCaoFilter) -> None:
        if current_user.id_VaiTro in SENIOR_REPORT_ROLE_IDS:
            return
        if current_user.id_VaiTro in MIDDLE_REPORT_ROLE_IDS:
            # BR24-2: cấp trung bị giới hạn phạm vi; DB chưa có scope dự án nên không tự cho xem toàn công ty.
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Chưa có cấu hình phạm vi dự án cho quản lý cấp trung",
            )
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn không có quyền xem báo cáo thống kê")

    def _to_chart(self, rows: list[dict]) -> list[dict]:
        chart: list[dict] = []
        for row in rows:
            label = str(row.get("chi_so") or row.get("du_an") or row.get("noi_dung") or "Dữ liệu")
            value = row.get("gia_tri") or row.get("tong_gio_thuc_te") or row.get("tong_gio") or 0
            chart.append({"label": label, "value": value, "tooltip": row})
        return chart
