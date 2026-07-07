from io import BytesIO
from typing import Any

from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.schemas.bao_cao_schema import BaoCaoResponse


def export_excel(report: BaoCaoResponse) -> BytesIO:
    """Render report data to Excel with a standard placeholder template."""
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Bao cao"
    # BR25-1: dùng placeholder logo/chữ ký; TODO thay bằng logo/mẫu chữ ký chính thức.
    sheet["A1"] = "HiCAS HRM - LOGO PLACEHOLDER"
    sheet["A2"] = f"Báo cáo: {report.loai.value}"
    sheet["A3"] = f"Từ {report.bo_loc.tu_ngay} đến {report.bo_loc.den_ngay}"
    sheet.append([])
    headers = _headers(report.bang_bieu)
    sheet.append(headers)
    for row in report.bang_bieu:
        sheet.append([_stringify(row.get(header)) for header in headers])
    sheet.append([])
    sheet.append(["Chữ ký xác nhận", "SIGNATURE PLACEHOLDER"])
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    return output


def export_pdf(report: BaoCaoResponse) -> BytesIO:
    """Render report data to PDF with a simple standard placeholder template."""
    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=A4)
    width, height = A4
    y = height - 50
    # BR25-1: dùng placeholder logo/chữ ký; TODO thay bằng logo/mẫu chữ ký chính thức.
    pdf.drawString(50, y, "HiCAS HRM - LOGO PLACEHOLDER")
    y -= 25
    pdf.drawString(50, y, f"Bao cao: {report.loai.value}")
    y -= 20
    pdf.drawString(50, y, f"Tu {report.bo_loc.tu_ngay} den {report.bo_loc.den_ngay}")
    y -= 30
    headers = _headers(report.bang_bieu)
    pdf.drawString(50, y, " | ".join(headers))
    y -= 18
    for row in report.bang_bieu:
        line = " | ".join(_stringify(row.get(header)) for header in headers)
        pdf.drawString(50, y, line[:110])
        y -= 18
        if y < 80:
            pdf.showPage()
            y = height - 50
    pdf.drawString(50, 50, "Chu ky xac nhan: SIGNATURE PLACEHOLDER")
    pdf.save()
    output.seek(0)
    return output


def _headers(rows: list[dict[str, Any]]) -> list[str]:
    if not rows:
        return ["noi_dung"]
    headers: list[str] = []
    for row in rows:
        for key in row.keys():
            if key not in headers:
                headers.append(key)
    return headers


def _stringify(value: Any) -> str:
    return "" if value is None else str(value)
