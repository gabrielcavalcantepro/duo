import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatBRL, formatBRLCompact } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-element shadow-rose px-3 py-2 border border-[var(--border)]">
        <p className="font-sans text-xs text-[var(--muted)] mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="font-sans text-sm font-medium" style={{ color: p.fill }}>
            {p.name}: {formatBRL(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChart({ data = [], height = 220, bars = [] }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,83,126,0.08)" />
        <XAxis dataKey="label" tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatBRLCompact(v)} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />}
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.fill} radius={[4, 4, 0, 0]} maxBarSize={40} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}
