export type DoiTuongNhan = 'TOAN_CONG_TY' | 'PHONG_BAN' | 'CA_NHAN';

export type ThongBao = {
  id_ThongBao: string;
  id_NguoiNhan: string;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: string;
  trangThaiDoc: number;
  thoiGianGui: string;
  id_doi_tuong_lien_quan?: string | null;
};

export type ThongBaoUnreadCount = {
  so_luong_chua_doc: number;
};

export type TaoThongBaoPayload = {
  tieuDe: string;
  noiDung: string;
  loaiThongBao: string;
  doi_tuong_nhan: DoiTuongNhan;
  id_nhan_vien_list?: string[] | null;
  id_phong_ban_list?: string[] | null;
  id_du_an_list?: string[] | null;
};

export type TaoThongBaoResponse = {
  so_luong_nguoi_nhan: number;
  id_thong_bao: string[];
};

export type NhanVienNhanOption = {
  id_NhanVien: string;
  hoTen: string;
  email: string;
  chucVu: string;
};
