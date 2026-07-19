import datetime
import sqlite3


conn = sqlite3.connect("demo_hicas.db")
cursor = conn.cursor()

now = datetime.datetime.now().isoformat(sep=" ", timespec="seconds")

rows = [
    (
        "TB-DEMO-NV001-001",
        "NV001",
        "Bảo trì hệ thống HRM",
        "Hệ thống HRM sẽ bảo trì từ 18:00 đến 19:00 hôm nay. Vui lòng lưu lại công việc đang xử lý.",
        "NOI_BO",
        0,
        now,
    ),
    (
        "TB-DEMO-NV001-002",
        "NV001",
        "Nhắc duyệt đơn nghỉ phép",
        "Có đơn nghỉ phép mới đang chờ xử lý trong danh sách duyệt.",
        "NGHI_PHEP",
        0,
        now,
    ),
    (
        "TB-DEMO-NV002-001",
        "NV002",
        "Đơn nghỉ phép đã được duyệt",
        "Đơn nghỉ phép của bạn đã được HCNS duyệt. Vui lòng kiểm tra lại bảng phép.",
        "NGHI_PHEP",
        0,
        now,
    ),
    (
        "TB-DEMO-NV003-001",
        "NV003",
        "Cập nhật chấm công tháng này",
        "Bảng công tháng này đã được tổng hợp. Vui lòng kiểm tra và tạo giải trình nếu cần.",
        "CHAM_CONG",
        0,
        now,
    ),
]

cursor.executemany(
    """
    INSERT OR REPLACE INTO ThongBao (
        id_ThongBao, id_NguoiNhan, tieuDe, noiDung, loaiThongBao, trangThaiDoc, thoiGianGui
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
    rows,
)

conn.commit()
conn.close()
print("Seed thong bao demo data completed.")
