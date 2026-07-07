"""SQLModel table mappings for the HiCAS HRM database."""

from app.models.bang_cong import BangCong
from app.models.chi_tiet_cap_nhat_ho_so import ChiTietCapNhatHoSo
from app.models.don_giai_trinh_cong import DonGiaiTrinhCong
from app.models.don_nghi_phep import DonNghiPhep
from app.models.don_nghi_viec import DonNghiViec
from app.models.giao_nhan_tai_san import GiaoNhanTaiSan
from app.models.hop_dong import HopDong
from app.models.lich_hop import LichHop
from app.models.nhan_vien import NhanVien
from app.models.phong_hop import PhongHop
from app.models.quy_phep import QuyPhep
from app.models.quyen import Quyen
from app.models.quyet_dinh_nghi_viec import QuyetDinhNghiViec
from app.models.tai_khoan import TaiKhoan
from app.models.tai_san import TaiSan
from app.models.thong_bao import ThongBao
from app.models.vai_tro import VaiTro
from app.models.vai_tro_quyen import VaiTroQuyen
from app.models.yeu_cau_cap_nhat_ho_so import YeuCauCapNhatHoSo

__all__ = [
    "BangCong",
    "ChiTietCapNhatHoSo",
    "DonGiaiTrinhCong",
    "DonNghiPhep",
    "DonNghiViec",
    "GiaoNhanTaiSan",
    "HopDong",
    "LichHop",
    "NhanVien",
    "PhongHop",
    "QuyPhep",
    "Quyen",
    "QuyetDinhNghiViec",
    "TaiKhoan",
    "TaiSan",
    "ThongBao",
    "VaiTro",
    "VaiTroQuyen",
    "YeuCauCapNhatHoSo",
]
