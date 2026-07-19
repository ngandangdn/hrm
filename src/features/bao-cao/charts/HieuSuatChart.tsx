import type { BaoCaoChartPoint } from '../types';
import { BaoCaoLineChart } from './common';

export default function HieuSuatChart({ data }: { data: BaoCaoChartPoint[] }) {
  return <BaoCaoLineChart data={data} />;
}
