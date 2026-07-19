"""Seed realistic demo data for HiCAS HRM.

Run:
    python -m seed.seed_data

The script is idempotent: it uses fixed primary keys and SQLAlchemy merge(), so
running it many times updates the same demo records instead of duplicating them.
If DB_URL is not set, it seeds the local SQLite demo database.
"""

from __future__ import annotations

import os
import shutil
import sys
from datetime import date, datetime, timedelta
from decimal import Decimal
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "Backend"
DATABASE_ROOT = PROJECT_ROOT / "Database"

sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DB_URL", f"sqlite:///{(DATABASE_ROOT / 'demo_hicas.db').as_posix()}")
os.environ.setdefault("ENVIRONMENT", "seed")

from sqlalchemy import text  # noqa: E402
from sqlmodel import Session, SQLModel  # noqa: E402

import app.models  # noqa: F401,E402
from app.core.database import engine  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.bang_cong import BangCong  # noqa: E402
from app.models.don_nghi_phep import DonNghiPhep  # noqa: E402
from app.models.don_nghi_viec import DonNghiViec  # noqa: E402
from app.models.giao_nhan_tai_san import GiaoNhanTaiSan  # noqa: E402
from app.models.hop_dong import HopDong  # noqa: E402
from app.models.lich_hop import LichHop  # noqa: E402
from app.models.nhan_vien import NhanVien  # noqa: E402
from app.models.phong_hop import PhongHop  # noqa: E402
from app.models.quy_phep import QuyPhep  # noqa: E402
from app.models.quyen import Quyen  # noqa: E402
from app.models.tai_khoan import TaiKhoan  # noqa: E402
from app.models.tai_san import TaiSan  # noqa: E402
from app.models.thanh_vien_lich_hop import ThanhVienLichHop  # noqa: E402
from app.models.thong_bao import ThongBao  # noqa: E402
from app.models.vai_tro import VaiTro  # noqa: E402
from app.models.vai_tro_quyen import VaiTroQuyen  # noqa: E402


PASSWORD = "Hicas@123"
NOW = datetime(2026, 7, 19, 9, 0, 0)
CONTRACT_TEMPLATE_SOURCE = DATABASE_ROOT / "templates" / "HopDongLaoDong_052026HiCAS.pdf"
CONTRACT_TEMPLATE_TARGET = BACKEND_ROOT / "uploads" / "hopdong" / "HopDongLaoDong_052026HiCAS.pdf"
CONTRACT_TEMPLATE_URL = "/uploads/hopdong/HopDongLaoDong_052026HiCAS.pdf"
NHAN_VIEN_EXTRA_COLUMNS = {
    "nganhNghe": "VARCHAR(150)",
    "trinhDoHocVan": "VARCHAR(100)",
    "trinhDoChuyenMon": "VARCHAR(150)",
    "truongDaoTao": "VARCHAR(150)",
    "chuyenNganh": "VARCHAR(150)",
    "namTotNghiep": "INTEGER",
    "kyNangNghe": "VARCHAR(500)",
    "chungChiNghe": "VARCHAR(255)",
    "bacKyNangNghe": "VARCHAR(100)",
    "ngoaiNgu": "VARCHAR(255)",
    "tinHoc": "VARCHAR(255)",
    "kinhNghiemLamViec": "VARCHAR(255)",
}


EMPLOYEES = [
    ("NV001", "Đặng Kim Ngân", "hcns@hicas.com.vn", "0987654321", "00120227248", "Nữ", "Nam Hồng, Ninh Bình", date(2004, 11, 2), "001202272480", 1, "Trưởng phòng HCNS", "HCNS"),
    ("NV002", "Trần Minh Quân", "admin@hicas.com.vn", "0901000002", "001090000002", "Nam", "Thanh Xuân, Hà Nội", date(1990, 4, 12), "001090000002", 1, "Quản trị hệ thống", "ADMIN"),
    ("NV003", "Phạm Hoàng Nam", "quanly@hicas.com.vn", "0912000003", "001091000003", "Nam", "Nam Từ Liêm, Hà Nội", date(1992, 11, 5), "001091000003", 1, "Quản lý vận hành", "MANAGER"),
    ("NV004", "Nguyễn Thu Hà", "nhanvien@hicas.com.vn", "0933000004", "001096000004", "Nữ", "Đống Đa, Hà Nội", date(1996, 3, 18), "001096000004", 1, "Nhân viên Hành chính", "NV"),
    ("NV005", "Lê Anh Tuấn", "tuan.le@hicas.com.vn", "0974000005", "079095000005", "Nam", "Quận 1, TP Hồ Chí Minh", date(1995, 7, 9), "079095000005", 1, "Chuyên viên tuyển dụng", "NV"),
    ("NV006", "Đặng Kim Ngân", "ngan.dk@hicas.com.vn", "0855000006", "031097000006", "Nữ", "Nam Hồng, Ninh Bình", date(2004, 11, 2), "031097000006", 1, "Chuyên viên Phân tích nghiệp vụ", "NV"),
    ("NV007", "Hoàng Gia Bảo", "bao.hoang@hicas.com.vn", "0886000007", "048094000007", "Nam", "Ninh Kiều, Cần Thơ", date(1994, 9, 2), "048094000007", 1, "Kỹ thuật viên IT", "NV"),
    ("NV008", "Đỗ Khánh Linh", "linh.do@hicas.com.vn", "0367000008", "075098000008", "Nữ", "Biên Hòa, Đồng Nai", date(1998, 12, 22), "075098000008", 1, "Nhân viên đào tạo", "NV"),
    ("NV009", "Bùi Đức Long", "long.bui@hicas.com.vn", "0398000009", "040093000009", "Nam", "Hạ Long, Quảng Ninh", date(1993, 5, 30), "040093000009", 1, "Tester", "NV"),
    ("NV010", "Ngô Bảo Châu", "chau.ngo@hicas.com.vn", "0709000010", "052099000010", "Nữ", "Thành phố Huế", date(1999, 1, 11), "052099000010", 1, "Nhân viên lễ tân", "NV"),
    ("NV011", "Đặng Minh Khang", "khang.dang@hicas.com.vn", "0811000011", "064096000011", "Nam", "Nha Trang, Khánh Hòa", date(1996, 10, 8), "064096000011", 1, "Chuyên viên phân tích dữ liệu", "NV"),
    ("NV012", "Phan Thảo Vy", "vy.phan@hicas.com.vn", "0822000012", "066000000012", "Nữ", "Thủ Dầu Một, Bình Dương", date(2000, 6, 17), "066000000012", 1, "Nhân viên truyền thông nội bộ", "NV"),
    ("NV013", "Trương Quốc Huy", "huy.truong@hicas.com.vn", "0833000013", "038092000013", "Nam", "Vinh, Nghệ An", date(1992, 8, 25), "038092000013", 1, "Trưởng nhóm dự án", "MANAGER"),
    ("NV014", "Hồ Ngọc Anh", "anh.ho@hicas.com.vn", "0844000014", "060098000014", "Nữ", "Quận 7, TP Hồ Chí Minh", date(1998, 4, 4), "060098000014", 1, "Kế toán", "NV"),
    ("NV015", "Mai Tiến Dũng", "dung.mai@hicas.com.vn", "0866000015", "012091000015", "Nam", "Long Biên, Hà Nội", date(1991, 12, 1), "012091000015", 1, "Quản lý dự án", "MANAGER"),
    ("NV016", "Tạ Phương Nhi", "nhi.ta@hicas.com.vn", "0877000016", "022097000016", "Nữ", "Bắc Ninh", date(1997, 7, 27), "022097000016", 1, "Nhân viên hành chính", "NV"),
    ("NV017", "Cao Văn Sơn", "son.cao@hicas.com.vn", "0899000017", "024094000017", "Nam", "Hà Đông, Hà Nội", date(1994, 3, 19), "024094000017", 1, "Tester", "NV"),
    ("NV018", "Lý Minh Trang", "trang.ly@hicas.com.vn", "0322000018", "036099000018", "Nữ", "Sơn Trà, Đà Nẵng", date(1999, 9, 13), "036099000018", 1, "Chuyên viên nhân sự", "NV"),
    ("NV019", "Dương Nhật Minh", "minh.duong@hicas.com.vn", "0333000019", "044095000019", "Nam", "Quy Nhơn, Bình Định", date(1995, 2, 23), "044095000019", 0, "Nhân viên vận hành", "NV"),
    ("NV020", "Lâm Hương Giang", "giang.lam@hicas.com.vn", "0344000020", "046096000020", "Nữ", "Mỹ Tho, Tiền Giang", date(1996, 11, 16), "046096000020", 0, "Nhân viên kinh doanh", "NV"),
]

QUALIFICATION_PROFILES = {
    "NV001": ("Quản trị nhân sự", "Đại học", "Cử nhân Quản trị nhân lực", "Đại học Kinh tế Quốc dân", "Quản trị nhân lực", 2026, "Hoạch định nhân sự, tuyển dụng, quan hệ lao động, xây dựng chính sách", "Chứng chỉ nghiệp vụ nhân sự; Chứng chỉ pháp luật lao động", "Bậc 4", "Tiếng Anh B2", "MOS Excel; HRM systems", "2 năm nhân sự và vận hành HRM"),
    "NV002": ("Công nghệ thông tin", "Đại học", "Kỹ sư Công nghệ thông tin", "Đại học Bách khoa Hà Nội", "Hệ thống thông tin", 2012, "Quản trị hệ thống, bảo mật, phân quyền, vận hành hạ tầng", "CompTIA Security+; ITIL Foundation", "Bậc 4", "Tiếng Anh B2", "Linux, SQL, Cloud, DevOps", "12 năm quản trị hệ thống"),
    "NV003": ("Quản trị vận hành", "Đại học", "Cử nhân Quản trị kinh doanh", "Đại học Thương mại", "Quản trị kinh doanh", 2014, "Điều phối vận hành, quản lý tiến độ, đánh giá hiệu suất", "PMP Foundation", "Bậc 4", "Tiếng Anh B1", "Excel nâng cao; Power BI", "10 năm vận hành và quản lý nhóm"),
    "NV004": ("Hành chính văn phòng", "Cao đẳng", "Cao đẳng Hành chính văn phòng", "Cao đẳng Kinh tế Công nghiệp Hà Nội", "Hành chính văn phòng", 2017, "Quản lý hồ sơ, văn thư, điều phối lịch làm việc", "Chứng chỉ văn thư lưu trữ", "Bậc 3", "Tiếng Anh A2", "Word, Excel, quản lý văn bản", "8 năm hành chính"),
    "NV005": ("Tuyển dụng", "Đại học", "Cử nhân Quản trị nhân lực", "Đại học Lao động - Xã hội", "Quản trị nhân lực", 2017, "Sàng lọc hồ sơ, phỏng vấn, xây dựng nguồn ứng viên", "Chứng chỉ tuyển dụng chuyên nghiệp", "Bậc 3", "Tiếng Anh B1", "ATS, Excel, LinkedIn Recruiter", "7 năm tuyển dụng"),
    "NV006": ("Phân tích nghiệp vụ", "Đại học", "Cử nhân Hệ thống thông tin quản lý", "Đại học Kinh tế Quốc dân", "Hệ thống thông tin quản lý", 2026, "Phân tích yêu cầu, mô hình hóa quy trình, viết tài liệu nghiệp vụ", "BA Foundation; SQL for Analytics", "Bậc 3", "Tiếng Anh B2", "SQL, Figma, BPMN, Excel", "1 năm phân tích nghiệp vụ"),
    "NV007": ("Công nghệ thông tin", "Cao đẳng", "Cao đẳng Mạng máy tính", "Cao đẳng FPT Polytechnic", "Quản trị mạng", 2016, "Hỗ trợ người dùng, quản trị thiết bị, xử lý sự cố", "CCNA", "Bậc 3", "Tiếng Anh A2", "Windows Server, Network, Helpdesk", "9 năm IT support"),
    "NV008": ("Đào tạo nội bộ", "Đại học", "Cử nhân Tâm lý giáo dục", "Đại học Sư phạm Hà Nội", "Tâm lý giáo dục", 2020, "Thiết kế chương trình đào tạo, đánh giá sau đào tạo", "Chứng chỉ Training Design", "Bậc 3", "Tiếng Anh B1", "PowerPoint, LMS, Canva", "5 năm đào tạo"),
    "NV009": ("Kiểm thử phần mềm", "Đại học", "Cử nhân Công nghệ phần mềm", "Đại học Công nghệ - ĐHQGHN", "Công nghệ phần mềm", 2015, "Kiểm thử chức năng, viết test case, quản lý lỗi", "ISTQB Foundation", "Bậc 3", "Tiếng Anh B1", "Jira, Postman, SQL", "9 năm kiểm thử"),
    "NV010": ("Lễ tân - Dịch vụ khách hàng", "Cao đẳng", "Cao đẳng Du lịch", "Cao đẳng Du lịch Hà Nội", "Quản trị dịch vụ", 2020, "Đón tiếp khách, điều phối phòng họp, chăm sóc nội bộ", "Chứng chỉ nghiệp vụ lễ tân", "Bậc 2", "Tiếng Anh B1", "Office, lịch điện tử", "5 năm lễ tân"),
    "NV011": ("Phân tích dữ liệu", "Đại học", "Cử nhân Thống kê kinh tế", "Đại học Kinh tế Quốc dân", "Thống kê kinh tế", 2018, "Làm sạch dữ liệu, trực quan hóa, phân tích chỉ số nhân sự", "Google Data Analytics", "Bậc 3", "Tiếng Anh B2", "SQL, Power BI, Python", "7 năm phân tích dữ liệu"),
    "NV012": ("Truyền thông nội bộ", "Đại học", "Cử nhân Quan hệ công chúng", "Học viện Báo chí và Tuyên truyền", "Quan hệ công chúng", 2022, "Viết nội dung, tổ chức sự kiện, truyền thông nhân viên", "Chứng chỉ truyền thông nội bộ", "Bậc 3", "Tiếng Anh B1", "Canva, PowerPoint, CMS", "4 năm truyền thông"),
    "NV013": ("Quản lý dự án", "Đại học", "Kỹ sư Công nghệ thông tin", "Đại học Công nghiệp Hà Nội", "Công nghệ thông tin", 2014, "Lập kế hoạch, quản lý phạm vi, quản lý rủi ro dự án", "Agile Scrum Master", "Bậc 4", "Tiếng Anh B2", "Jira, MS Project, Confluence", "11 năm triển khai dự án"),
    "NV014": ("Kế toán", "Đại học", "Cử nhân Kế toán", "Học viện Tài chính", "Kế toán doanh nghiệp", 2020, "Hạch toán, đối soát, báo cáo tài chính nội bộ", "Chứng chỉ kế toán trưởng", "Bậc 3", "Tiếng Anh A2", "MISA, Excel nâng cao", "5 năm kế toán"),
    "NV015": ("Quản lý dự án", "Đại học", "Cử nhân Quản trị dự án", "Đại học Kinh tế TP.HCM", "Quản trị dự án", 2013, "Quản lý ngân sách, điều phối nguồn lực, nghiệm thu", "PMP", "Bậc 4", "Tiếng Anh B2", "MS Project, Power BI", "12 năm quản lý dự án"),
    "NV016": ("Hành chính văn phòng", "Cao đẳng", "Cao đẳng Quản trị văn phòng", "Cao đẳng Thương mại và Du lịch", "Quản trị văn phòng", 2018, "Quản lý công văn, hậu cần văn phòng, tài sản văn phòng", "Chứng chỉ hành chính văn phòng", "Bậc 2", "Tiếng Anh A2", "Word, Excel, quản lý văn bản", "7 năm hành chính"),
    "NV017": ("Kiểm thử phần mềm", "Đại học", "Cử nhân Khoa học máy tính", "Đại học Vinh", "Khoa học máy tính", 2016, "Kiểm thử hồi quy, kiểm thử API, tự động hóa cơ bản", "ISTQB Foundation", "Bậc 3", "Tiếng Anh B1", "Postman, Selenium, SQL", "9 năm kiểm thử"),
    "NV018": ("Nhân sự tổng hợp", "Đại học", "Cử nhân Luật kinh tế", "Đại học Luật Hà Nội", "Luật kinh tế", 2021, "Hồ sơ lao động, hợp đồng, bảo hiểm và thủ tục nhân sự", "Chứng chỉ C&B", "Bậc 3", "Tiếng Anh B1", "Excel, phần mềm BHXH, HRM", "4 năm nhân sự"),
    "NV019": ("Vận hành", "Trung cấp", "Trung cấp Quản lý vận hành", "Trung cấp Kinh tế Kỹ thuật", "Vận hành doanh nghiệp", 2014, "Theo dõi ca làm, kiểm soát quy trình, bàn giao công việc", "Chứng chỉ an toàn lao động", "Bậc 2", "Tiếng Anh A1", "Excel cơ bản, phần mềm nội bộ", "10 năm vận hành"),
    "NV020": ("Kinh doanh", "Đại học", "Cử nhân Marketing", "Đại học Kinh tế TP.HCM", "Marketing", 2018, "Tư vấn khách hàng, quản lý pipeline, chăm sóc sau bán", "Chứng chỉ bán hàng B2B", "Bậc 3", "Tiếng Anh B1", "CRM, Excel, PowerPoint", "7 năm kinh doanh"),
}


def upsert(session: Session, item: object) -> None:
    session.merge(item)


def ensure_demo_contract_file() -> None:
    """Copy the official demo labor contract template into the served uploads folder."""
    CONTRACT_TEMPLATE_TARGET.parent.mkdir(parents=True, exist_ok=True)
    if CONTRACT_TEMPLATE_SOURCE.exists():
        shutil.copyfile(CONTRACT_TEMPLATE_SOURCE, CONTRACT_TEMPLATE_TARGET)


def ensure_profile_columns(session: Session) -> None:
    """Keep the local SQLite demo database compatible when profile fields are added."""
    if not str(engine.url).startswith("sqlite"):
        return
    existing_columns = {
        row[1]
        for row in session.exec(text("PRAGMA table_info(NhanVien)")).all()
    }
    for column_name, column_type in NHAN_VIEN_EXTRA_COLUMNS.items():
        if column_name not in existing_columns:
            session.exec(text(f"ALTER TABLE NhanVien ADD COLUMN {column_name} {column_type}"))
    session.commit()


def cleanup_legacy_demo_data(session: Session) -> None:
    """Remove old ad-hoc demo rows so this seed owns the demo dataset."""
    statements = [
        "PRAGMA foreign_keys=OFF",
        "DELETE FROM ThanhVienLichHop WHERE id_LichHop LIKE 'LH-DEMO-%'",
        "DELETE FROM LichHop WHERE id_LichHop LIKE 'LH-DEMO-%'",
        "DELETE FROM ThanhVienLichHop WHERE id_LichHop='LH-ROOM-001'",
        "DELETE FROM LichHop WHERE id_LichHop='LH-ROOM-001'",
        "DELETE FROM ThongBao WHERE id_ThongBao LIKE 'TB-DEMO-%'",
        "DELETE FROM DonNghiPhep WHERE id_DonPhep LIKE 'DNP-DEMO-%'",
        "DELETE FROM BangCong WHERE id_BangCong LIKE 'BC-DEMO-%'",
        "DELETE FROM DonNghiViec WHERE id_DonNghiViec LIKE 'DNV-DEMO-%'",
        "DELETE FROM QuyetDinhNghiViec WHERE id_QuyetDinh LIKE 'QDNV-DEMO-%'",
        "DELETE FROM GiaoNhanTaiSan WHERE id_TaiSan LIKE 'MAC-%' OR id_TaiSan LIKE 'MON-%' OR id_TaiSan LIKE 'KEY-%'",
        "DELETE FROM TaiSan WHERE id_TaiSan LIKE 'MAC-%' OR id_TaiSan LIKE 'MON-%' OR id_TaiSan LIKE 'KEY-%'",
        "DELETE FROM HopDong WHERE id_HopDong IN ('HD-ADMIN001', 'HD-NV001', 'HD-NV002', 'HD-NV003')",
        "DELETE FROM PhongHop WHERE id_Phong IN ('PH-301')",
        "DELETE FROM NhanVien WHERE id_NhanVien='ADMIN001'",
        "DELETE FROM TaiKhoan WHERE id_TaiKhoan='ADMIN001'",
        "PRAGMA foreign_keys=ON",
    ]
    for statement in statements:
        session.exec(text(statement))


def seed_roles_accounts_employees(session: Session) -> None:
    roles = [
        VaiTro(id_VaiTro="ADMIN", tenVaiTro="Quản trị hệ thống", moTa="Toàn quyền hệ thống"),
        VaiTro(id_VaiTro="HCNS", tenVaiTro="Nhân sự HCNS", moTa="Quản lý nhân sự và phê duyệt"),
        VaiTro(id_VaiTro="MANAGER", tenVaiTro="Quản lý", moTa="Quản lý"),
        VaiTro(id_VaiTro="NV", tenVaiTro="Nhân viên", moTa="Người dùng nhân viên"),
    ]
    permissions = [
        Quyen(id_Quyen="Q_PHAN_QUYEN", tenQuyen="Phân quyền", moTa="Quản lý vai trò", hanhDong="phan_quyen"),
        Quyen(id_Quyen="Q_DANH_MUC", tenQuyen="Danh mục", moTa="Quản lý danh mục", hanhDong="danh_muc"),
        Quyen(id_Quyen="Q_HO_SO", tenQuyen="Hồ sơ", moTa="Xem và cập nhật hồ sơ", hanhDong="ho_so"),
        Quyen(id_Quyen="Q_NGHI_PHEP", tenQuyen="Nghỉ phép", moTa="Tạo và duyệt nghỉ phép", hanhDong="nghi_phep"),
        Quyen(id_Quyen="Q_CHAM_CONG", tenQuyen="Chấm công", moTa="Xem và duyệt bảng công", hanhDong="cham_cong"),
        Quyen(id_Quyen="Q_TAI_SAN", tenQuyen="Tài sản", moTa="Quản lý tài sản", hanhDong="tai_san"),
        Quyen(id_Quyen="Q_BAO_CAO", tenQuyen="Báo cáo", moTa="Xem báo cáo thống kê", hanhDong="bao_cao"),
    ]
    for item in [*roles, *permissions]:
        upsert(session, item)
    role_permissions = {
        "ADMIN": [item.id_Quyen for item in permissions],
        "HCNS": [item.id_Quyen for item in permissions],
        "MANAGER": ["Q_HO_SO", "Q_NGHI_PHEP", "Q_CHAM_CONG", "Q_TAI_SAN", "Q_BAO_CAO"],
        "NV": ["Q_HO_SO", "Q_NGHI_PHEP", "Q_CHAM_CONG"],
    }
    for role_id, permission_ids in role_permissions.items():
        for permission_id in permission_ids:
            upsert(session, VaiTroQuyen(id_VaiTro=role_id, id_Quyen=permission_id))

    password_hash = hash_password(PASSWORD)
    for emp in EMPLOYEES:
        emp_id, name, email, phone, tax, gender, address, birth, cccd, status, title, role = emp
        qualification = QUALIFICATION_PROFILES[emp_id]
        account_status = 0 if emp_id in {"NV019", "NV020"} else 1
        upsert(session, TaiKhoan(id_TaiKhoan=emp_id, email=email, matKhau=password_hash, trangThai=account_status, ngayTao=NOW, id_VaiTro=role))
        upsert(
            session,
            NhanVien(
                id_NhanVien=emp_id,
                hoTen=name,
                email=email,
                sdt=phone,
                maSoThue=tax,
                gioiTinh=gender,
                diaChi=address,
                ngaySinh=birth,
                cccd=cccd,
                trangThaiLamViec=status,
                chucVu=title,
                nganhNghe=qualification[0],
                trinhDoHocVan=qualification[1],
                trinhDoChuyenMon=qualification[2],
                truongDaoTao=qualification[3],
                chuyenNganh=qualification[4],
                namTotNghiep=qualification[5],
                kyNangNghe=qualification[6],
                chungChiNghe=qualification[7],
                bacKyNangNghe=qualification[8],
                ngoaiNgu=qualification[9],
                tinHoc=qualification[10],
                kinhNghiemLamViec=qualification[11],
            ),
        )


def seed_contracts(session: Session) -> None:
    expiring_contracts = {
        "NV005": date(2026, 7, 24),
        "NV008": date(2026, 7, 31),
        "NV011": date(2026, 8, 12),
        "NV014": date(2026, 8, 26),
    }
    inactive_contracts = {
        "NV019": date(2026, 7, 10),
        "NV020": date(2026, 6, 28),
    }
    indefinite_contracts = {"NV001", "NV002", "NV003", "NV004", "NV013", "NV015"}
    for index, emp in enumerate(EMPLOYEES, start=1):
        emp_id = emp[0]
        start = date(2023 + (index % 3), (index % 12) + 1, 1)
        end = expiring_contracts.get(emp_id) or inactive_contracts.get(emp_id)
        fixed_term = emp_id not in indefinite_contracts
        if fixed_term and end is None:
            end = date(2027 + (index % 2), ((index + 3) % 12) + 1, 25)
        upsert(
            session,
            HopDong(
                id_HopDong=f"HD-{emp_id}-2026",
                loaiHopDong="Xác định thời hạn 24 tháng" if fixed_term else "Không xác định thời hạn",
                ngayBatDau=start,
                ngayKetThuc=end,
                trangThaiHopDong=0 if emp_id in {"NV019", "NV020"} else 1,
                tepHopDong=CONTRACT_TEMPLATE_URL,
                id_NhanVien=emp_id,
            ),
        )


def seed_resignations(session: Session) -> None:
    rows = [
        ("DNV-NV019-202607", "NV019", datetime(2026, 6, 20, 9, 15), date(2026, 7, 10), "Chuyển nơi cư trú", "Đã bàn giao tài khoản, tài liệu vận hành và tài sản", 1, "Đã hoàn tất quyết định nghỉ việc"),
        ("DNV-NV020-202607", "NV020", datetime(2026, 6, 12, 14, 0), date(2026, 7, 24), "Định hướng công việc mới", "Đang bàn giao khách hàng phụ trách", 1, "Chờ đối soát công nợ nội bộ"),
        ("DNV-NV017-202607", "NV017", datetime(2026, 7, 8, 10, 30), date(2026, 7, 31), "Lý do gia đình", "Bàn giao test case và tài khoản dự án", 0, "Đơn đang chờ HCNS xử lý"),
        ("DNV-NV012-202608", "NV012", datetime(2026, 7, 18, 15, 0), date(2026, 8, 15), "Chuyển công tác", "Lập kế hoạch bàn giao truyền thông nội bộ", 0, "Dự kiến nghỉ trong kỳ sau"),
    ]
    for id_don, emp_id, created_at, last_day, reason, handover, status, note in rows:
        upsert(
            session,
            DonNghiViec(
                id_DonNghiViec=id_don,
                ngayTao=created_at,
                ngayLamViecCuoi=last_day,
                lyDoNghiViec=reason,
                noiDungBanGiao=handover,
                trangThai=status,
                ghiChu=note,
                id_NhanVien=emp_id,
            ),
        )


def leave_days(start: date, end: date) -> Decimal:
    return Decimal((end - start).days + 1)


def seed_leave(session: Session) -> None:
    leave_rows: list[DonNghiPhep] = []
    leave_types = ["Phép năm", "Nghỉ ốm", "Việc gia đình", "Nghỉ không lương"]
    reasons = ["Giải quyết việc gia đình", "Khám sức khỏe", "Chăm sóc người thân", "Nghỉ phép cá nhân"]
    for index, emp in enumerate(EMPLOYEES, start=1):
        emp_id = emp[0]
        quota_id = f"QP-{emp_id}-2026"
        upsert(session, QuyPhep(id_QuyPhep=quota_id, id_NhanVien=emp_id, nam=2026, tongQuyPhep=Decimal("12.0"), soNgayDaDung=Decimal("0.0"), soNgayChoDuyet=Decimal("0.0"), ngayCapNhat=NOW, trangThai=1))
        status = (index - 1) % 4
        start = date(2026, 7, 1) + timedelta(days=index)
        end = start + timedelta(days=index % 2)
        leave_rows.append(
            DonNghiPhep(
                id_DonPhep=f"DNP-{emp_id}-001",
                loaiPhep=leave_types[index % len(leave_types)],
                ngayTao=datetime.combine(start - timedelta(days=3), datetime.min.time()).replace(hour=9),
                tuNgay=start,
                denNgay=end,
                trangThai=status,
                lyDoTuChoi="Không đủ chứng từ xác nhận" if status == 2 else None,
                lyDo=reasons[index % len(reasons)],
                thoiGianDuyet=NOW - timedelta(days=2) if status in {1, 2} else None,
                nguoiDuyet="NV001",
                id_NhanVien=emp_id,
                id_QuyPhep=quota_id,
            )
        )
    for row in leave_rows:
        upsert(session, row)

    # Recompute QuyPhep from DonNghiPhep so totals match approved/pending leave days.
    used: dict[str, Decimal] = {}
    pending: dict[str, Decimal] = {}
    for row in leave_rows:
        days = leave_days(row.tuNgay, row.denNgay)
        if row.trangThai == 1 and row.id_NhanVien:
            used[row.id_NhanVien] = used.get(row.id_NhanVien, Decimal("0.0")) + days
        if row.trangThai == 0 and row.id_NhanVien:
            pending[row.id_NhanVien] = pending.get(row.id_NhanVien, Decimal("0.0")) + days
    for emp in EMPLOYEES:
        emp_id = emp[0]
        quota = session.get(QuyPhep, f"QP-{emp_id}-2026")
        if quota:
            quota.soNgayDaDung = used.get(emp_id, Decimal("0.0"))
            quota.soNgayChoDuyet = pending.get(emp_id, Decimal("0.0"))
            quota.ngayCapNhat = NOW
            upsert(session, quota)


def seed_attendance_notifications(session: Session) -> None:
    attendance_plan = [
        ("HiCAS HRM", Decimal("176.0"), Decimal("171.5"), 1),
        ("HiCAS HRM", Decimal("168.0"), Decimal("164.0"), 2),
        ("HiCAS HRM", Decimal("152.0"), Decimal("149.0"), 0),
        ("HiCAS HRM", Decimal("160.0"), Decimal("156.5"), 1),
        ("Cổng thông tin nội bộ", Decimal("172.0"), Decimal("169.0"), 0),
        ("Cổng thông tin nội bộ", Decimal("166.0"), Decimal("160.5"), 3),
        ("Cổng thông tin nội bộ", Decimal("158.0"), Decimal("151.0"), 2),
        ("Tối ưu quy trình HCNS", Decimal("150.0"), Decimal("145.5"), 1),
        ("Tối ưu quy trình HCNS", Decimal("144.0"), Decimal("139.0"), 4),
        ("Tối ưu quy trình HCNS", Decimal("136.0"), Decimal("130.5"), 2),
        ("Bảo trì hệ thống", Decimal("128.0"), Decimal("124.0"), 1),
        ("Bảo trì hệ thống", Decimal("120.0"), Decimal("116.5"), 0),
        ("Bảo trì hệ thống", Decimal("112.0"), Decimal("108.0"), 2),
        ("Đào tạo nhân sự", Decimal("96.0"), Decimal("92.5"), 0),
        ("Đào tạo nhân sự", Decimal("88.0"), Decimal("83.0"), 1),
        ("Đào tạo nhân sự", Decimal("72.0"), Decimal("68.0"), 0),
        ("Triển khai eKYC nội bộ", Decimal("132.0"), Decimal("126.5"), 3),
        ("Triển khai eKYC nội bộ", Decimal("118.0"), Decimal("112.0"), 2),
        ("Vận hành văn phòng", Decimal("104.0"), Decimal("99.0"), 1),
        ("Vận hành văn phòng", Decimal("84.0"), Decimal("78.5"), 2),
    ]
    for index, emp in enumerate(EMPLOYEES, start=1):
        emp_id = emp[0]
        project, planned_hours, actual_hours, late_count = attendance_plan[index - 1]
        upsert(
            session,
            BangCong(
                id_BangCong=f"BC-{emp_id}-202607",
                id_NhanVien=emp_id,
                tenBangCong="Bảng công tháng 07/2026",
                loaiHinhTinhCong="Logtime",
                tongGioLogtime=planned_hours,
                tongGioLogtimeThucTe=actual_hours,
                tenDuAn_Task=project,
                soLanDiMuon=late_count,
                tuNgay=date(2026, 7, 1),
                denNgay=date(2026, 7, 31),
                ngayCapNhat=NOW,
                trangThai=index % 2,
            ),
        )
        for notice_no in range(1, 3):
            unread = 0 if notice_no == 1 else 1
            upsert(
                session,
                ThongBao(
                    id_ThongBao=f"TB-{emp_id}-{notice_no:02d}",
                    id_NguoiNhan=emp_id,
                    tieuDe="Thông báo duyệt đơn nghỉ phép" if notice_no == 1 else "Nhắc lịch họp sắp tới",
                    noiDung="Đơn nghỉ phép của bạn đã được cập nhật trạng thái." if notice_no == 1 else "Bạn có lịch họp trong tuần này, vui lòng kiểm tra phòng họp.",
                    loaiThongBao="Nghỉ phép" if notice_no == 1 else "Lịch họp",
                    trangThaiDoc=unread,
                    thoiGianGui=NOW - timedelta(hours=index + notice_no),
                ),
            )


def seed_rooms_assets_meetings(session: Session) -> None:
    rooms = [
        ("PH-101", "Phòng họp khu A", 12, 1, "Phòng họp nhỏ tầng 1"),
        ("PH-102", "Phòng họp khu B", 10, 1, "Phòng họp nhanh khu HCNS"),
        ("PH-201", "Phòng họp Khu C", 24, 1, "Phòng họp lớn tầng 2"),
        ("PH-202", "Phòng họp khu D", 18, 1, "Có màn hình trình chiếu"),
        ("PH-501", "Phòng họp bảo trì", 6, 0, "Tạm ngừng sử dụng"),
    ]
    for room in rooms:
        upsert(session, PhongHop(id_Phong=room[0], tenPhong=room[1], sucChua=room[2], trangThai=room[3], moTa=room[4]))

    asset_names = ["Laptop Dell Latitude", "Màn hình LG 24 inch", "Điện thoại iPhone", "Máy in Canon", "Máy chiếu Epson", "Bộ docking USB-C", "Máy scan Fujitsu"]
    asset_count = 32
    in_use_asset_ids = set(range(1, 23))
    for index in range(1, asset_count + 1):
        asset_id = f"TS-{index:03d}"
        in_use = index in in_use_asset_ids
        upsert(
            session,
            TaiSan(
                id_TaiSan=asset_id,
                tenTaiSan=f"{asset_names[index % len(asset_names)]} {index:02d}",
                serialNumber=f"HICAS-{2026}{index:04d}",
                ngayMua=date(2024 + index % 3, (index % 12) + 1, 10),
                giaTri=Decimal(8_000_000 + index * 750_000),
                tinhTrang="Tốt" if index % 5 else "Cần bảo trì",
                trangThai=1 if in_use else 0,
            ),
        )
        employee_id = EMPLOYEES[(index - 1) % len(EMPLOYEES)][0]
        returned = not in_use and index <= 28
        upsert(
            session,
            GiaoNhanTaiSan(
                id_GiaoNhan=f"GN-{index:03d}",
                ngayCapPhat=NOW - timedelta(days=120 - index),
                tinhTrangBanGiao="Hoạt động tốt",
                tinhTrangThuHoi=("Hỏng nhẹ" if index % 7 == 0 else "Đầy đủ phụ kiện") if returned else None,
                tepBienBan=f"/uploads/tai-san/bien-ban-gn-{index:03d}.pdf",
                ngayThuHoi=NOW - timedelta(days=index) if returned else None,
                trangThai=0 if returned else 1,
                id_TaiSan=asset_id,
                id_NhanVien=employee_id,
            ),
        )

    statuses = [1, 1, 1, 0, 1, 2, 1, 3]
    priorities = ["normal", "high", "urgent"]
    for index in range(1, 25):
        creator = EMPLOYEES[(index - 1) % 16][0]
        room_id = rooms[(index - 1) % len(rooms)][0]
        if index <= 18:
            start = datetime(2026, 7, 2, 8, 0) + timedelta(days=index, hours=index % 7)
        else:
            start = datetime(2026, 8, 1, 8, 0) + timedelta(days=index - 18, hours=index % 5)
        end = start + timedelta(hours=1 + (index % 2))
        meeting_id = f"LH-2026-{index:03d}"
        upsert(
            session,
            LichHop(
                id_LichHop=meeting_id,
                id_NhanVien=creator,
                id_Phong=room_id,
                tieuDe=f"Họp triển khai kế hoạch tuần {index}",
                noiDung="Trao đổi tiến độ, phân công đầu việc và các vấn đề cần hỗ trợ.",
                thoiGianBatDau=start,
                thoiGianKetThuc=end,
                mucDoUuTien=priorities[index % len(priorities)],
                trangThai=statuses[(index - 1) % len(statuses)],
            ),
        )
        member_ids = list(dict.fromkeys([creator, EMPLOYEES[index % 16][0], EMPLOYEES[(index + 3) % 16][0]]))
        for member_id in member_ids:
            upsert(
                session,
                ThanhVienLichHop(
                    id_LichHop=meeting_id,
                    id_NhanVien=member_id,
                    vaiTroThamGia="chu_tri" if member_id == creator else "tham_du",
                    trangThaiThamGia="da_xac_nhan" if member_id == creator or index % 3 == 0 else "cho_xac_nhan",
                ),
            )


def run() -> None:
    ensure_demo_contract_file()
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        ensure_profile_columns(session)
        cleanup_legacy_demo_data(session)
        seed_roles_accounts_employees(session)
        seed_contracts(session)
        seed_resignations(session)
        seed_leave(session)
        seed_attendance_notifications(session)
        seed_rooms_assets_meetings(session)
        session.commit()
    print("Seed data ready. Demo accounts: hcns/admin/quanly/nhanvien @hicas.com.vn, password Hicas@123")


if __name__ == "__main__":
    run()
