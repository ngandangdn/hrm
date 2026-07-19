import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { BaoCaoChartPoint } from '../types';
import { formatValue } from '../utils';

const COLORS = ['#4338ca', '#0891b2', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

function normalizedData(data: BaoCaoChartPoint[]) {
  return data.map((item) => ({
    ...item,
    value: Number(item.value || 0),
  }));
}

export function BaoCaoBarChart({ data }: { data: BaoCaoChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={normalizedData(data)} margin={{ top: 12, right: 20, left: 4, bottom: 36 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" angle={-20} textAnchor="end" interval={0} height={70} />
        <YAxis />
        <Tooltip formatter={(value) => formatValue(value)} />
        <Bar dataKey="value" name="Giá trị" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BaoCaoLineChart({ data }: { data: BaoCaoChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={normalizedData(data)} margin={{ top: 12, right: 20, left: 4, bottom: 36 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" angle={-20} textAnchor="end" interval={0} height={70} />
        <YAxis />
        <Tooltip formatter={(value) => formatValue(value)} />
        <Line type="monotone" dataKey="value" name="Giá trị" stroke="#4338ca" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BaoCaoPieChart({ data }: { data: BaoCaoChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Tooltip formatter={(value) => formatValue(value)} />
        <Legend />
        <Pie data={normalizedData(data)} dataKey="value" nameKey="label" innerRadius={64} outerRadius={112} paddingAngle={3}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
