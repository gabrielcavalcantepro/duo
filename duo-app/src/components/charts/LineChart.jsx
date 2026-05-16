import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { formatBRL, formatBRLCompact } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-element shadow-rose px-3 py-2 border border-[var(--border)]">
        <p className="font-sans text-xs text-[var(--muted)] mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="font-sans text-sm font-medium" style={{ color: p.stroke || p.fill }}>
            {formatBRL(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LineChart({ data = [], dataKey = 'value', height = 180, color = 'var(--rose)', area = true }) {
  if (area) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,83,126,0.08)" />
          <XAxis dataKey="label" tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => formatBRLCompact(v)} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#lineGrad)" dot={{ fill: color, strokeWidth: 2, r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,83,126,0.08)" />
        <XAxis dataKey="label" tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatBRLCompact(v)} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} />
      </ReLineChart>
    </ResponsiveContainer>
  );
}
