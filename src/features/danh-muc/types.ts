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
