from datetime import date, datetime
from decimal import Decimal
from typing import Any


def _parse_date(value: Any) -> date:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return datetime.fromisoformat(str(value)).date()


def tinh_cong_redmine(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert approved Redmine logtime to attendance rows for CTV/TTS."""
    preview: list[dict[str, Any]] = []
    for row in rows:
        hours = Decimal(str(row["tongGioLogtime"]))
        # BR18-2: CTV/TTS tính theo giờ logtime Redmine đã duyệt, bỏ qua hoàn toàn check-in/check-out.
        preview.append(
            {
                "id_NhanVien": str(row["id_NhanVien"]).strip(),
                "tenBangCong": str(row.get("tenBangCong") or "Bang cong Redmine").strip(),
                "loaiHinhTinhCong": "redmine",
                "tongGioLogtime": hours,
                "tongGioLogtimeThucTe": hours,
                "tenDuAn_Task": row.get("tenDuAn_Task"),
                "soLanDiMuon": 0,
                "tuNgay": _parse_date(row["tuNgay"]),
                "denNgay": _parse_date(row["denNgay"]),
            }
        )
    return preview
