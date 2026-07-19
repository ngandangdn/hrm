import sqlite3
import datetime

conn = sqlite3.connect('demo_hicas.db')
cursor = conn.cursor()

# Kiểm tra xem đã có dữ liệu chưa
cursor.execute("SELECT COUNT(*) FROM TaiSan")
count = cursor.fetchone()[0]

if count > 0:
    print("Đã có dữ liệu tài sản, bỏ qua seed.")
else:
    print("Đang tạo dữ liệu tài sản mẫu...")
    
    assets = [
        ("MAC-2023-001", "MacBook Pro M2 14 inch", "C02GGH1234", "2023-05-10", 45000000.0, "Mới 100%", 1),
        ("MAC-2023-002", "MacBook Air M2 13 inch", "C02G238A4B", "2023-08-15", 28000000.0, "Mới 100%", 1),
        ("MON-DELL-001", "Màn hình Dell UltraSharp 27 4K", "DELL-2723-01", "2023-06-20", 12000000.0, "Đã qua sử dụng (Tốt)", 1),
        ("KEY-KEY-001", "Bàn phím cơ Keychron K2", None, "2023-01-05", 2500000.0, "Bình thường", 1),
        ("MAC-2022-001", "MacBook Pro M1 16 inch", "C02M1A2B3C", "2022-02-10", 55000000.0, "Mới 95%", 1),
    ]
    
    cursor.executemany("""
    INSERT INTO TaiSan (
        id_TaiSan, tenTaiSan, serialNumber, ngayMua, giaTri, tinhTrang, trangThai
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, assets)

    conn.commit()
    print("Tạo dữ liệu tài sản thành công!")

conn.close()
