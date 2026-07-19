from datetime import date, timedelta
from decimal import Decimal


def tinh_so_ngay_nghi_thuc_te(tu_ngay: date, den_ngay: date) -> Decimal:
    """Count working leave days, excluding Saturday and Sunday.

    TODO: trừ thêm ngày lễ khi có danh mục ngày lễ công ty. Hiện tại chưa có
    bảng ngày lễ trong 19 bảng B1 nên không tự thêm dữ liệu ngoài đặc tả.
    """
    current = tu_ngay
    total = Decimal("0")
    while current <= den_ngay:
        if current.weekday() < 5:
            # BR11-3/BR13-3: đơn vị ngày phép dùng Decimal, tối thiểu hỗ trợ 0.5 ngày.
            total += Decimal("1")
        current += timedelta(days=1)
    return total
