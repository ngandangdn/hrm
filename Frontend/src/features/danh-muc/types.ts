export type DanhMucBase = {
  trangThai: number;
  moTa?: string | null;
};

export type PhongHop = DanhMucBase & {
  id_Phong: string;
  tenPhong: string;
  sucChua: number;
};

export type PhongHopPayload = {
  id_Phong?: string;
  tenPhong?: string;
  sucChua?: number;
  trangThai?: number;
  moTa?: string | null;
};

export type TaiSanDanhMuc = {
  id_TaiSan: string;
  tenTaiSan: string;
  serialNumber?: string | null;
  ngayMua?: string | null;
  giaTri?: number | string | null;
  tinhTrang: string;
  trangThai: number;
};

export type QuyenDanhMuc = {
  id_Quyen: string;
  tenQuyen: string;
  hanhDong: string;
  moTa?: string | null;
};

export type QuyPhepDanhMuc = {
  id_QuyPhep: string;
  id_NhanVien: string;
  nam: number;
  tongQuyPhep: number | string;
  soNgayDaDung: number | string;
  soNgayChoDuyet: number | string;
  ngayCapNhat?: string | null;
  trangThai: number;
};
