"""Create/update a local SQLite demo database for manual frontend flows.

This helper is intentionally outside app/ so it is not a backend migration or
seed. It uses the backend table names and columns, but only prepares local demo
data for Codex/browser verification when MySQL credentials are unavailable.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

from passlib.context import CryptContext


DB_PATH = Path("demo_hicas.db")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def exec_many(cursor: sqlite3.Cursor, sql: str, rows: list[tuple[object, ...]]) -> None:
    cursor.executemany(sql, rows)


def main() -> None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executescript(
        """
        PRAGMA foreign_keys = OFF;
        CREATE TABLE IF NOT EXISTS VaiTro (
          id_VaiTro VARCHAR(50) PRIMARY KEY,
          tenVaiTro VARCHAR(150) NOT NULL,
          moTa VARCHAR(255)
        );
        CREATE TABLE IF NOT EXISTS Quyen (
          id_Quyen VARCHAR(50) PRIMARY KEY,
          tenQuyen VARCHAR(150) NOT NULL,
          moTa VARCHAR(255),
          hanhDong VARCHAR(100) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS VaiTro_Quyen (
          id_VaiTro VARCHAR(50) NOT NULL,
          id_Quyen VARCHAR(50) NOT NULL,
          PRIMARY KEY (id_VaiTro, id_Quyen)
        );
        CREATE TABLE IF NOT EXISTS TaiKhoan (
          id_TaiKhoan VARCHAR(50) PRIMARY KEY,
          email VARCHAR(150) NOT NULL UNIQUE,
          matKhau VARCHAR(255) NOT NULL,
          trangThai INTEGER NOT NULL DEFAULT 1,
          ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
          id_VaiTro VARCHAR(50) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS NhanVien (
          id_NhanVien VARCHAR(50) PRIMARY KEY,
          hoTen VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL,
          sdt VARCHAR(20) NOT NULL,
          maSoThue VARCHAR(50),
          gioiTinh VARCHAR(10) NOT NULL,
          diaChi VARCHAR(255),
          ngaySinh DATE NOT NULL,
          cccd VARCHAR(20) NOT NULL UNIQUE,
          trangThaiLamViec INTEGER NOT NULL DEFAULT 1,
          chucVu VARCHAR(100) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS HopDong (
          id_HopDong VARCHAR(50) PRIMARY KEY,
          loaiHopDong VARCHAR(100) NOT NULL,
          ngayBatDau DATE NOT NULL,
          ngayKetThuc DATE,
          trangThaiHopDong INTEGER NOT NULL DEFAULT 1,
          tepHopDong VARCHAR(255),
          id_NhanVien VARCHAR(50) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS QuyPhep (
          id_QuyPhep VARCHAR(50) PRIMARY KEY,
          id_NhanVien VARCHAR(50) NOT NULL,
          nam INTEGER NOT NULL,
          tongQuyPhep DECIMAL(5, 1) NOT NULL,
          soNgayDaDung DECIMAL(5, 1) NOT NULL DEFAULT 0,
          soNgayChoDuyet DECIMAL(5, 1) NOT NULL DEFAULT 0,
          ngayCapNhat DATETIME NOT NULL,
          trangThai INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS DonNghiPhep (
          id_DonPhep VARCHAR(50) PRIMARY KEY,
          loaiPhep VARCHAR(100) NOT NULL,
          ngayTao DATETIME NOT NULL,
          tuNgay DATE NOT NULL,
          denNgay DATE NOT NULL,
          trangThai INTEGER NOT NULL DEFAULT 0,
          lyDoTuChoi VARCHAR(255),
          lyDo VARCHAR(255) NOT NULL,
          thoiGianDuyet DATETIME,
          nguoiDuyet VARCHAR(50) NOT NULL,
          id_NhanVien VARCHAR(50),
          id_QuyPhep VARCHAR(50) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS PhongHop (
          id_Phong VARCHAR(50) PRIMARY KEY,
          tenPhong VARCHAR(150) NOT NULL,
          sucChua INTEGER NOT NULL,
          trangThai INTEGER NOT NULL DEFAULT 1,
          moTa VARCHAR(255)
        );
        CREATE TABLE IF NOT EXISTS YeuCauCapNhatHoSo (
          id_YeuCau VARCHAR(50) PRIMARY KEY,
          ngayGui DATETIME NOT NULL,
          trangThai INTEGER NOT NULL DEFAULT 0,
          nguoiDuyet VARCHAR(50) NOT NULL,
          thoiGianDuyet DATETIME,
          ghiChu VARCHAR(255),
          id_NhanVien VARCHAR(50) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS ChiTietCapNhatHoSo (
          id_ChiTiet VARCHAR(50) PRIMARY KEY,
          id_YeuCau VARCHAR(50) NOT NULL UNIQUE,
          tenTruong VARCHAR(100) NOT NULL,
          nhomThongTin VARCHAR(100) NOT NULL,
          giaTriCu VARCHAR(255),
          giaTriMoi VARCHAR(255) NOT NULL,
          ghiChu VARCHAR(255)
        );
        CREATE TABLE IF NOT EXISTS DonNghiViec (
          id_DonNghiViec VARCHAR(50) PRIMARY KEY,
          ngayTao DATETIME NOT NULL,
          ngayLamViecCuoi DATE NOT NULL,
          lyDoNghiViec VARCHAR(255) NOT NULL,
          noiDungBanGiao VARCHAR(255),
          trangThai INTEGER NOT NULL DEFAULT 0,
          ghiChu VARCHAR(255),
          id_NhanVien VARCHAR(50) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS QuyetDinhNghiViec (
          id_QuyetDinh VARCHAR(50) PRIMARY KEY,
          soQuyetDinh VARCHAR(50) NOT NULL,
          ngayKy DATE NOT NULL,
          nguoiKy VARCHAR(150) NOT NULL,
          lyDoNghiViec VARCHAR(255) NOT NULL,
          tepQuyetDinh VARCHAR(255),
          id_DonNghiViec VARCHAR(50) NOT NULL UNIQUE
        );
        """
    )

    demo_hash = pwd_context.hash("Hicas@123")
    employee_hash = demo_hash

    exec_many(
        cursor,
        "INSERT OR REPLACE INTO VaiTro (id_VaiTro, tenVaiTro, moTa) VALUES (?, ?, ?)",
        [
            ("ADMIN", "Quan tri he thong", "Toan quyen he thong"),
            ("HCNS", "Nhan su HCNS", "Quan ly nhan su, phan quyen va phe duyet"),
            ("MANAGER", "Quan ly", "Quan ly cap trung"),
            ("NV", "Nhan vien", "Nguoi dung nhan vien thong thuong"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO Quyen (id_Quyen, tenQuyen, moTa, hanhDong) VALUES (?, ?, ?, ?)",
        [
            ("Q_PHAN_QUYEN", "Phan quyen", "Xem va cap nhat vai tro tai khoan", "phan_quyen"),
            ("Q_PHE_DUYET", "Phe duyet yeu cau", "Duyet hoac tu choi yeu cau cap nhat ho so", "phe_duyet"),
            ("Q_DANH_MUC", "Quan ly danh muc", "CRUD danh muc dung chung", "danh_muc"),
            ("Q_HO_SO_CA_NHAN", "Ho so ca nhan", "Xem va gui yeu cau cap nhat ho so", "ho_so_ca_nhan"),
            ("Q_NGHI_VIEC", "Nghi viec", "Tao don va quyet dinh nghi viec", "nghi_viec"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO VaiTro_Quyen (id_VaiTro, id_Quyen) VALUES (?, ?)",
        [
            ("ADMIN", "Q_PHAN_QUYEN"),
            ("ADMIN", "Q_PHE_DUYET"),
            ("ADMIN", "Q_DANH_MUC"),
            ("ADMIN", "Q_HO_SO_CA_NHAN"),
            ("ADMIN", "Q_NGHI_VIEC"),
            ("HCNS", "Q_PHAN_QUYEN"),
            ("HCNS", "Q_PHE_DUYET"),
            ("HCNS", "Q_DANH_MUC"),
            ("HCNS", "Q_HO_SO_CA_NHAN"),
            ("HCNS", "Q_NGHI_VIEC"),
            ("NV", "Q_HO_SO_CA_NHAN"),
            ("NV", "Q_NGHI_VIEC"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO TaiKhoan (id_TaiKhoan, email, matKhau, trangThai, id_VaiTro) VALUES (?, ?, ?, ?, ?)",
        [
            ("NV002", "admin@hicas.com.vn", demo_hash, 1, "ADMIN"),
            ("NV001", "hcns@hicas.com.vn", demo_hash, 1, "HCNS"),
            ("NV004", "nhanvien@hicas.com.vn", employee_hash, 1, "NV"),
            ("NV003", "quanly@hicas.com.vn", employee_hash, 1, "MANAGER"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO NhanVien VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            ("NV002", "Trần Minh Quân", "admin@hicas.com.vn", "0901000002", "001090000002", "Nam", "Thanh Xuân, Hà Nội", "1990-04-12", "001090000002", 1, "Quản trị hệ thống"),
            ("NV001", "Đặng Kim Ngân", "hcns@hicas.com.vn", "0987654321", "00120227248", "Nữ", "Cầu Giấy, Hà Nội", "2001-08-20", "001202272480", 1, "Trưởng phòng HCNS"),
            ("NV004", "Nguyễn Thu Hà", "nhanvien@hicas.com.vn", "0933000004", "001096000004", "Nữ", "Đống Đa, Hà Nội", "1996-03-18", "001096000004", 1, "Nhân viên Hành chính"),
            ("NV003", "Phạm Hoàng Nam", "quanly@hicas.com.vn", "0912000003", "001091000003", "Nam", "Nam Từ Liêm, Hà Nội", "1992-11-05", "001091000003", 1, "Quản lý vận hành"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO HopDong VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("HD-ADMIN001", "Không xác định thời hạn", "2022-01-01", None, 1, None, "ADMIN001"),
            ("HD-NV001", "Không xác định thời hạn", "2022-01-01", None, 1, None, "NV001"),
            ("HD-NV002", "Xác định thời hạn 12 tháng", "2024-01-01", "2026-12-31", 1, None, "NV002"),
            ("HD-NV003", "Xác định thời hạn 12 tháng", "2024-06-01", "2026-12-31", 1, None, "NV003"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO QuyPhep VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            ("QP-NV001-2026", "NV001", 2026, 12.0, 1.0, 0.0, "2026-07-10 08:00:00", 1),
            ("QP-NV002-2026", "NV002", 2026, 12.0, 2.0, 1.0, "2026-07-10 08:00:00", 1),
            ("QP-NV003-2026", "NV003", 2026, 12.0, 3.0, 0.0, "2026-07-10 08:00:00", 1),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO DonNghiPhep VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            ("DNP-DEMO-001", "Phep nam", "2026-07-01 09:00:00", "2026-07-15", "2026-07-15", 0, None, "Nghi viec gia dinh", None, "PENDING", "NV002", "QP-NV002-2026"),
            ("DNP-DEMO-002", "Phep nam", "2026-06-20 10:00:00", "2026-06-25", "2026-06-26", 1, None, "Nghi phep ca nhan", "2026-06-21 08:30:00", "NV001", "NV003", "QP-NV003-2026"),
            ("DNP-DEMO-003", "Nghi om", "2026-05-12 14:00:00", "2026-05-13", "2026-05-13", 2, "Chua bo sung xac nhan y te", "Nghi om", "2026-05-12 16:00:00", "NV001", "NV002", "QP-NV002-2026"),
            ("DNP-DEMO-004", "Phep nam", "2026-04-01 08:20:00", "2026-04-05", "2026-04-05", 3, None, "Huy do doi lich ca nhan", None, "PENDING", "NV002", "QP-NV002-2026"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO PhongHop VALUES (?, ?, ?, ?, ?)",
        [
            ("PH-101", "Phong hop Hoa Sen", 12, 1, "Phong hop nho tang 1"),
            ("PH-201", "Phong hop Tre", 24, 1, "Phong hop lon tang 2"),
            ("PH-301", "Phong dao tao", 40, 1, "Phong dao tao noi bo"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO YeuCauCapNhatHoSo VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("YC-DEMO-001", "2026-07-10 08:30:00", 0, "PENDING", None, None, "NV002"),
            ("YC-DEMO-002", "2026-07-09 09:00:00", 1, "NV001", "2026-07-09 10:00:00", "Da duyet", "NV003"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO ChiTietCapNhatHoSo VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("CT-DEMO-001", "YC-DEMO-001", "sdt", "lien_he", "0902000002", "0988123456", "Nhan vien cap nhat so dien thoai"),
            ("CT-DEMO-002", "YC-DEMO-002", "diaChi", "lien_he", "Ha Noi", "Da Nang", "Da duyet dia chi moi"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO DonNghiViec VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            ("DNV-DEMO-001", "2026-07-01 09:00:00", "2026-08-15", "Ly do ca nhan", "Ban giao tai lieu va tai khoan noi bo", 0, "Cho HCNS xu ly", "NV002"),
            ("DNV-DEMO-002", "2026-06-20 14:00:00", "2026-07-31", "Chuyen noi cong tac", "Ban giao cong viec cho quan ly truc tiep", 1, "Da lap quyet dinh", "NV003"),
        ],
    )
    exec_many(
        cursor,
        "INSERT OR REPLACE INTO QuyetDinhNghiViec VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("QDNV-DEMO-001", "QD-2026-001", "2026-07-05", "Đặng Kim Ngân", "Chuyen noi cong tac", None, "DNV-DEMO-002"),
        ],
    )

    conn.commit()
    print(f"Demo SQLite data ready: {DB_PATH.resolve()}")


if __name__ == "__main__":
    main()
