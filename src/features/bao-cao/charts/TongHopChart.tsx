import type { BaoCaoChartPoint } from '../types';
import { BaoCaoBarChart } from './common';

export default function TongHopChart({ data }: { data: BaoCaoChartPoint[] }) {
  return <BaoCaoBarChart data={data} />;
}
