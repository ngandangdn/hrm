export type LoaiBaoCao = 'hanh-chinh' | 'hieu-suat' | 'tong-hop' | 'quan-tri';

export type DinhDangBaoCao = 'excel' | 'pdf';

export type BaoCaoFilter = {
  tu_ngay: string;
  den_ngay: string;
  phong_ban?: string;
  du_an?: string;
};

export type BaoCaoChartPoint = {
  label: string;
  value: number | string;
  tooltip?: Record<string, unknown>;
};

export type BaoCaoResponse = {
  loai: LoaiBaoCao;
  bo_loc: BaoCaoFilter;
  bieu_do: BaoCaoChartPoint[];
  bang_bieu: Array<Record<string, unknown>>;
  co_du_lieu: boolean;
};

export type BaoCaoDanhMuc = {
  loai: LoaiBaoCao;
  ten: string;
  mo_ta: string;
};

export type XuatBaoCaoRequest = BaoCaoFilter & {
  dinh_dang: DinhDangBaoCao;
};
