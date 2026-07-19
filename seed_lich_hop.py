import sqlite3

conn = sqlite3.connect("demo_hicas.db")
cursor = conn.cursor()

cursor.executescript(
    """
    CREATE TABLE IF NOT EXISTS PhongHop (
      id_Phong VARCHAR(50) PRIMARY KEY,
      tenPhong VARCHAR(150) NOT NULL,
      sucChua INTEGER NOT NULL,
      trangThai INTEGER NOT NULL DEFAULT 1,
      moTa VARCHAR(255)
    );
    CREATE TABLE IF NOT EXISTS LichHop (
      id_LichHop VARCHAR(50) PRIMARY KEY,
      id_NhanVien VARCHAR(50) NOT NULL,
      tieuDe VARCHAR(255) NOT NULL,
      noiDung TEXT,
      thoiGianBatDau DATETIME NOT NULL,
      thoiGianKetThuc DATETIME NOT NULL,
      mucDoUuTien VARCHAR(50) NOT NULL,
      trangThai INTEGER NOT NULL DEFAULT 0,
      id_Phong VARCHAR(50) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ThanhVienLichHop (
      id_LichHop VARCHAR(50) NOT NULL,
      id_NhanVien VARCHAR(50) NOT NULL,
      vaiTroThamGia VARCHAR(50) NOT NULL DEFAULT 'tham_du',
      trangThaiThamGia VARCHAR(50) NOT NULL DEFAULT 'cho_xac_nhan',
      PRIMARY KEY (id_LichHop, id_NhanVien)
    );
    """
)

cursor.executemany(
    "INSERT OR REPLACE INTO PhongHop VALUES (?, ?, ?, ?, ?)",
    [
        ("PH-101", "Phòng họp Hoa Sen", 12, 1, "Phòng họp nhỏ tầng 1"),
        ("PH-201", "Phòng họp Tre", 24, 1, "Phòng họp lớn tầng 2"),
        ("PH-301", "Phòng đào tạo", 40, 1, "Phòng đào tạo nội bộ"),
    ],
)

cursor.executemany(
    "INSERT OR REPLACE INTO LichHop VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
        (
            "LH-DEMO-001",
            "NV001",
            "Họp giao ban HCNS",
            "Rà soát lịch nghỉ phép và hồ sơ nhân sự trong tuần",
            "2026-07-21 09:00:00",
            "2026-07-21 10:00:00",
            "normal",
            0,
            "PH-101",
        ),
        (
            "LH-DEMO-002",
            "NV002",
            "Trao đổi kế hoạch vận hành",
            "Chuẩn bị lịch trực và phân công hỗ trợ nội bộ",
            "2026-07-22 14:00:00",
            "2026-07-22 15:30:00",
            "high",
            0,
            "PH-201",
        ),
        (
            "LH-DEMO-003",
            "NV003",
            "Đào tạo quy trình sử dụng hệ thống",
            "Buổi hướng dẫn nội bộ cho nhân viên mới",
            "2026-07-24 08:30:00",
            "2026-07-24 11:00:00",
            "normal",
            1,
            "PH-301",
        ),
    ],
)

cursor.executemany(
    "INSERT OR REPLACE INTO ThanhVienLichHop VALUES (?, ?, ?, ?)",
    [
        ("LH-DEMO-001", "NV001", "chu_tri", "da_xac_nhan"),
        ("LH-DEMO-001", "NV002", "tham_du", "cho_xac_nhan"),
        ("LH-DEMO-001", "NV003", "tham_du", "cho_xac_nhan"),
        ("LH-DEMO-002", "NV002", "chu_tri", "da_xac_nhan"),
        ("LH-DEMO-002", "NV001", "tham_du", "cho_xac_nhan"),
        ("LH-DEMO-003", "NV003", "chu_tri", "da_xac_nhan"),
        ("LH-DEMO-003", "NV001", "tham_du", "da_xac_nhan"),
    ],
)

conn.commit()
conn.close()

print("Seeded demo meeting rooms and schedules into demo_hicas.db")
