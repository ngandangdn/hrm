import type { BaoCaoChartPoint } from '../types';
import { BaoCaoPieChart } from './common';

export default function QuanTriChart({ data }: { data: BaoCaoChartPoint[] }) {
  return <BaoCaoPieChart data={data} />;
}
