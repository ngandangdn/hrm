from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlmodel import Session, select

from app.models.bang_cong import BangCong
from app.models.don_nghi_viec import DonNghiViec
from app.models.giao_nhan_tai_san import GiaoNhanTaiSan
from app.models.hop_dong import HopDong
from app.models.lich_hop import LichHop
from app.models.nhan_vien import NhanVien
from app.models.phong_hop import PhongHop
from app.models.tai_san import TaiSan
from app.schemas.bao_cao_schema import BaoCaoFilter


class BaoCaoRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def bao_cao_hanh_chinh(self, filters: BaoCaoFilter) -> dict[str, Any]:
        """Aggregate HR admin data from NhanVien, HopDong, DonNghiViec, QuyetDinhNghiViec."""
        # BR24-1: query trực tiếp từ bảng nghiệp vụ, không dùng cache/snapshot trung gian.
        nhan_vien = list(self.session.exec(select(NhanVien)).all())
        hop_dong = list(self.session.exec(select(HopDong)).all())
        don_nghi_viec = list(self.session.exec(select(DonNghiViec)).all())

        active_count = sum(1 for item in nhan_vien if item.trangThaiLamViec == 1)
        inactive_count = sum(1 for item in nhan_vien if item.trangThaiLamViec == 0)
        soon_limit = filters.den_ngay + timedelta(days=30)
        expiring_contracts = [
            item
            for item in hop_dong
            if item.ngayKetThuc is not None and filters.tu_ngay <= item.ngayKetThuc <= soon_limit
        ]
        resignations = [
            item
            for item in don_nghi_viec
            if filters.tu_ngay <= item.ngayLamViecCuoi <= filters.den_ngay
        ]
        return {
            "summary": {
                "nhan_vien_dang_lam": active_count,
                "nhan_vien_da_nghi": inactive_count,
                "hop_dong_sap_het_han": len(expiring_contracts),
                "don_nghi_viec_trong_ky": len(resignations),
            },
            "rows": [
                {"chi_so": "Nhân viên đang làm", "gia_tri": active_count},
                {"chi_so": "Nhân viên đã nghỉ", "gia_tri": inactive_count},
                {"chi_so": "Hợp đồng sắp hết hạn", "gia_tri": len(expiring_contracts)},
                {"chi_so": "Đơn nghỉ việc trong kỳ", "gia_tri": len(resignations)},
            ],
        }

    def bao_cao_hieu_suat(self, filters: BaoCaoFilter) -> dict[str, Any]:
        """Aggregate performance data from BangCong, grouped by tenDuAn_Task when available."""
        # BR24-1: query trực tiếp từ bảng BangCong, không dùng cache/snapshot trung gian.
        rows = list(self.session.exec(select(BangCong)).all())
        filtered = [
            item
            for item in rows
            if item.tuNgay <= filters.den_ngay
            and item.denNgay >= filters.tu_ngay
            and (filters.du_an is None or item.tenDuAn_Task == filters.du_an)
        ]
        grouped: dict[str, dict[str, Any]] = {}
        for item in filtered:
            key = item.tenDuAn_Task or "Không xác định"
            bucket = grouped.setdefault(
                key,
                {"du_an": key, "tong_gio": Decimal("0"), "tong_gio_thuc_te": Decimal("0"), "so_lan_di_muon": 0},
            )
            bucket["tong_gio"] += item.tongGioLogtime or Decimal("0")
            bucket["tong_gio_thuc_te"] += item.tongGioLogtimeThucTe or Decimal("0")
            bucket["so_lan_di_muon"] += item.soLanDiMuon or 0
        return {"summary": {"so_du_an": len(grouped)}, "rows": list(grouped.values())}

    def bao_cao_tong_hop(self, filters: BaoCaoFilter) -> dict[str, Any]:
        """Build an overview dashboard from administrative and performance report data."""
        # BR24-1: tổng hợp real-time bằng cách gọi lại các truy vấn nghiệp vụ trực tiếp.
        admin = self.bao_cao_hanh_chinh(filters)
        performance = self.bao_cao_hieu_suat(filters)
        return {
            "summary": {
                **admin["summary"],
                "so_du_an_co_cong": performance["summary"]["so_du_an"],
            },
            "rows": admin["rows"] + performance["rows"],
        }

    def bao_cao_quan_tri(self, filters: BaoCaoFilter) -> dict[str, Any]:
        """Aggregate governance data from TaiSan, GiaoNhanTaiSan, LichHop, and PhongHop."""
        # BR24-1: query trực tiếp từ bảng tài sản/phòng họp, không dùng cache/snapshot trung gian.
        tai_san = list(self.session.exec(select(TaiSan)).all())
        giao_nhan = list(self.session.exec(select(GiaoNhanTaiSan)).all())
        lich_hop = list(self.session.exec(select(LichHop)).all())
        phong_hop = list(self.session.exec(select(PhongHop)).all())

        assets_in_use = sum(1 for item in tai_san if item.trangThai == 0)
        assets_ready = sum(1 for item in tai_san if item.trangThai == 1)
        meetings_in_period = [
            item
            for item in lich_hop
            if filters.tu_ngay <= item.thoiGianBatDau.date() <= filters.den_ngay
        ]
        return {
            "summary": {
                "tai_san_dang_su_dung": assets_in_use,
                "tai_san_san_sang": assets_ready,
                "luot_luan_chuyen_tai_san": len(giao_nhan),
                "tong_phong_hop": len(phong_hop),
                "lich_hop_trong_ky": len(meetings_in_period),
            },
            "rows": [
                {"chi_so": "Tài sản đang sử dụng", "gia_tri": assets_in_use},
                {"chi_so": "Tài sản sẵn sàng", "gia_tri": assets_ready},
                {"chi_so": "Lượt luân chuyển tài sản", "gia_tri": len(giao_nhan)},
                {"chi_so": "Tổng phòng họp", "gia_tri": len(phong_hop)},
                {"chi_so": "Lịch họp trong kỳ", "gia_tri": len(meetings_in_period)},
            ],
        }
