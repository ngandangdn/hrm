export type ThongTinChung = {
  id_NhanVien: string;
  hoTen: string;
  gioiTinh: string;
  ngaySinh: string;
  cccd: string;
  maSoThue?: string | null;
  trangThaiLamViec: number;
};

export type LienHe = {
  email: string;
  sdt: string;
  diaChi?: string | null;
};

export type CongViec = {
  chucVu: string;
  nganhNghe?: string | null;
  trinhDoHocVan?: string | null;
  trinhDoChuyenMon?: string | null;
  truongDaoTao?: string | null;
  chuyenNganh?: string | null;
  namTotNghiep?: number | null;
  kyNangNghe?: string | null;
  chungChiNghe?: string | null;
  bacKyNangNghe?: string | null;
  ngoaiNgu?: string | null;
  tinHoc?: string | null;
  kinhNghiemLamViec?: string | null;
};

export type HopDongHienHanh = {
  id_HopDong: string;
  loaiHopDong: string;
  ngayBatDau: string;
  ngayKetThuc?: string | null;
  trangThaiHopDong: number;
  tepHopDong?: string | null;
};

export type HoSoTaiLieuFile = {
  id: string;
  loaiHoSo: string;
  tenLoaiHoSo: string;
  tenFile: string;
  duongDan: string;
  kichThuoc: number;
  thoiGianUpload: string;
};

export type HoSoCaNhan = {
  thong_tin_chung: ThongTinChung;
  lien_he: LienHe;
  cong_viec: CongViec;
  hop_dong?: HopDongHienHanh | null;
  ho_so_tai_lieu?: HoSoTaiLieuFile[];
};

export type NhanVienSeed = {
  id_NhanVien: string;
  hoTen: string;
  email: string;
  chucVu: string;
};

export type NhanVienHoSoListItem = {
  id_NhanVien: string;
  hoTen: string;
  email: string;
  sdt: string;
  gioiTinh: string;
  ngaySinh: string;
  cccd: string;
  maSoThue?: string | null;
  diaChi?: string | null;
  chucVu: string;
  nganhNghe?: string | null;
  trinhDoHocVan?: string | null;
  trinhDoChuyenMon?: string | null;
  truongDaoTao?: string | null;
  chuyenNganh?: string | null;
  namTotNghiep?: number | null;
  kyNangNghe?: string | null;
  chungChiNghe?: string | null;
  bacKyNangNghe?: string | null;
  ngoaiNgu?: string | null;
  tinHoc?: string | null;
  kinhNghiemLamViec?: string | null;
  trangThaiLamViec: number;
};
