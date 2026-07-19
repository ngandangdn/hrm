export type LeaveStatus = 0 | 1 | 2 | 3;

export type BangPhepItem = {
  id_QuyPhep: string;
  id_NhanVien: string;
  nam: number;
  tongQuyPhep: string | number;
  soNgayDaDung: string | number;
  soNgayChoDuyet: string | number;
  so_ngay_con_lai: string | number;
  trangThai: number;
};

export type DonNghiPhep = {
  id_DonPhep: string;
  loaiPhep: string;
  ngayTao: string;
  tuNgay: string;
  denNgay: string;
  so_ngay_nghi: string | number;
  trangThai: LeaveStatus;
  lyDo: string;
  lyDoTuChoi?: string | null;
  thoiGianDuyet?: string | null;
  nguoiDuyet: string;
  id_NhanVien?: string | null;
  id_QuyPhep: string;
  co_the_huy: boolean;
};

export type DonNghiPhepDetail = {
  don: DonNghiPhep;
  lich_su_xu_ly: {
    ngay_tao?: string | null;
    thoi_gian_duyet?: string | null;
    nguoi_thuc_hien?: string | null;
    ly_do_tu_choi?: string | null;
  };
};

export type TaoDonPhepPayload = {
  loaiPhep: string;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
  id_QuyPhep: string;
};

export type BangPhepFilters = {
  nam?: number;
  page: number;
  size: number;
};

export type LichSuPhepFilters = {
  id_nhan_vien?: string;
  nam?: number;
  thang?: number;
  page: number;
  size: number;
};

export type DanhSachDonPhepFilters = {
  nam?: number;
  trang_thai?: LeaveStatus;
  tu_ngay?: string;
  den_ngay?: string;
  page: number;
  size: number;
};
