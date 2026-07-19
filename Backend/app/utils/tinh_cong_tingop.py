from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal
from typing import Any


def _parse_date(value: Any) -> date:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return datetime.fromisoformat(str(value)).date()


def tinh_cong_tingop(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Calculate attendance for official employees from TingOp check records."""
    grouped: dict[tuple[str, str], dict[str, Any]] = defaultdict(
        lambda: {"ngay": set(), "soLanDiMuon": 0}
    )
    for row in rows:
        id_nhan_vien = str(row["id_NhanVien"]).strip()
        ten_bang_cong = str(row.get("tenBangCong") or "Bang cong TingOp").strip()
        ngay = _parse_date(row["ngay"])
        key = (id_nhan_vien, ten_bang_cong)
        grouped[key]["ngay"].add(ngay)
        if str(row.get("diMuon") or "").lower() in {"1", "true", "yes", "co", "có"}:
            grouped[key]["soLanDiMuon"] += 1

    preview: list[dict[str, Any]] = []
    for (id_nhan_vien, ten_bang_cong), data in grouped.items():
        days = sorted(data["ngay"])
        # BR18-1: TingOp chỉ cần có check-in hoặc check-out trong ngày thì vẫn ghi nhận đủ 1 ngày công.
        work_days = Decimal(len(days))
        preview.append(
            {
                "id_NhanVien": id_nhan_vien,
                "tenBangCong": ten_bang_cong,
                "loaiHinhTinhCong": "tingop",
                "tongGioLogtime": work_days * Decimal("8"),
                "tongGioLogtimeThucTe": work_days * Decimal("8"),
                "tenDuAn_Task": None,
                "soLanDiMuon": data["soLanDiMuon"],
                "tuNgay": days[0],
                "denNgay": days[-1],
            }
        )
    return preview
