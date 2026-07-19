export type VaiTro = {
  id_VaiTro: string;
  tenVaiTro?: string;
  moTa?: string | null;
};

export type PhanQuyenData = {
  vai_tro_he_thong: VaiTro[];
  vai_tro_da_gan: string[];
};

export type NhanVienOption = {
  id_NhanVien: string;
  hoTen: string;
  email?: string;
  chucVu?: string;
  phongBan?: string;
};

export type YeuCauCapNhat = {
  id_YeuCau: string;
  ngayGui: string;
  trangThai: number;
  nguoiDuyet: string;
  thoiGianDuyet?: string | null;
  ghiChu?: string | null;
  id_NhanVien: string;
};

export type ChiTietCapNhat = {
  id_ChiTiet: string;
  id_YeuCau: string;
  tenTruong: string;
  nhomThongTin: string;
  giaTriCu?: string | null;
  giaTriMoi: string;
  ghiChu?: string | null;
};

export type YeuCauCapNhatDetail = {
  yeu_cau: YeuCauCapNhat;
  chi_tiet: ChiTietCapNhat[];
};
