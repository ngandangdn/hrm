export type PhongHop = {
  id_Phong: string;
  tenPhong: string;
  sucChua: number;
  trangThai: number;
  moTa?: string | null;
};

export type LichHop = {
  id_LichHop: string;
  id_NhanVien: string;
  id_Phong: string;
  tieuDe: string;
  noiDung?: string | null;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  mucDoUuTien: string;
  trangThai: number;
  thanhVien: ThanhVienLichHop[];
};

export type LichHopCreatePayload = {
  id_Phong: string;
  tieuDe: string;
  noiDung?: string | null;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  mucDoUuTien: string;
  id_NhanVienThamGia: string[];
};

export type LichHopXuLyPayload = {
  lyDo?: string;
};

export type ThanhVienLichHop = {
  id_LichHop: string;
  id_NhanVien: string;
  vaiTroThamGia: string;
  trangThaiThamGia: string;
};

export type NhanVienOption = {
  id_NhanVien: string;
  hoTen: string;
  email: string;
  chucVu: string;
};
