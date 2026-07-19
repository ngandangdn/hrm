import datetime
import sqlite3


conn = sqlite3.connect("demo_hicas.db")
cursor = conn.cursor()

cursor.execute("SELECT id_NhanVien FROM NhanVien WHERE id_NhanVien LIKE 'NV%' ORDER BY id_NhanVien")
nhan_viens = [row[0] for row in cursor.fetchall()]

now = datetime.datetime.now()
now_text = now.isoformat(sep=" ", timespec="seconds")
thang = now.month
nam = now.year
tu_ngay = f"{nam}-{thang:02d}-01"
den_ngay = f"{nam}-{thang:02d}-28"
demo_names = (
    f"Bảng công tháng {thang}/{nam} - Dự án A",
    f"Chấm công nội bộ tháng {thang}/{nam}",
)

cursor.execute(
    """
    SELECT id_BangCong
    FROM BangCong
    WHERE tuNgay = ?
      AND denNgay = ?
      AND tenBangCong IN (?, ?)
    """,
    (tu_ngay, den_ngay, *demo_names),
)
old_demo_ids = [row[0] for row in cursor.fetchall()]
if old_demo_ids:
    placeholders = ",".join("?" for _ in old_demo_ids)
    cursor.execute(f"DELETE FROM DonGiaiTrinhCong WHERE id_BangCong IN ({placeholders})", old_demo_ids)
    cursor.execute(f"DELETE FROM BangCong WHERE id_BangCong IN ({placeholders})", old_demo_ids)

for id_nhan_vien in nhan_viens:
    redmine_id = f"BC-DEMO-{id_nhan_vien}-REDMINE-{nam}{thang:02d}"
    tingop_id = f"BC-DEMO-{id_nhan_vien}-TINGOP-{nam}{thang:02d}"
    don_id = f"DGTC-DEMO-{id_nhan_vien}-{nam}{thang:02d}"

    cursor.execute(
        """
        INSERT OR REPLACE INTO BangCong (
            id_BangCong, id_NhanVien, tenBangCong, loaiHinhTinhCong,
            tongGioLogtime, tongGioLogtimeThucTe, tenDuAn_Task,
            soLanDiMuon, tuNgay, denNgay, ngayCapNhat, trangThai
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            redmine_id,
            id_nhan_vien,
            f"Bảng công tháng {thang}/{nam} - Dự án A",
            "redmine",
            160,
            160,
            "Project A",
            0,
            tu_ngay,
            den_ngay,
            now_text,
            0,
        ),
    )

    cursor.execute(
        """
        INSERT OR REPLACE INTO BangCong (
            id_BangCong, id_NhanVien, tenBangCong, loaiHinhTinhCong,
            tongGioLogtime, tongGioLogtimeThucTe, tenDuAn_Task,
            soLanDiMuon, tuNgay, denNgay, ngayCapNhat, trangThai
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            tingop_id,
            id_nhan_vien,
            f"Chấm công nội bộ tháng {thang}/{nam}",
            "tingop",
            160,
            152,
            None,
            2,
            tu_ngay,
            den_ngay,
            now_text,
            0,
        ),
    )

    cursor.execute(
        """
        INSERT OR REPLACE INTO DonGiaiTrinhCong (
            id_DonGiaiTrinh, id_NhanVien, id_BangCong, ngayGiaiTrinh, ngayTao,
            trangThai, lyDo, nguoiDuyet, lyDoTuChoi, thoiGianDuyet
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            don_id,
            id_nhan_vien,
            tingop_id,
            f"{nam}-{thang:02d}-10",
            now_text,
            0,
            "Quên chấm công lúc về do máy chấm công lỗi",
            "PENDING",
            None,
            None,
        ),
    )

conn.commit()
conn.close()
print("Seed cham cong demo data completed.")
