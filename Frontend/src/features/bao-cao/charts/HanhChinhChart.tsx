import type { BaoCaoChartPoint } from '../types';
import { BaoCaoBarChart } from './common';

export default function HanhChinhChart({ data }: { data: BaoCaoChartPoint[] }) {
  return <BaoCaoBarChart data={data} />;
}
