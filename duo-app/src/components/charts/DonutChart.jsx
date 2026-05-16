import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatBRL } from '../../utils/formatters';

const COLORS = ['#D4537E','#1D9E75','#8B5CF6','#F59E0B','#3B82F6','#F97316','#EC4899','#06B6D4','#10B981','#6366F1','#EF4444','#A78BFA'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white rounded-element shadow-rose px-3 py-2 border border-[var(--border)]">
        <p className="font-sans text-sm font-medium text-[var(--ink)]">{name}</p>
        <p className="font-sans text-sm text-[var(--rose)]">{formatBRL(value)}</p>
      </div>
    );
  }
  return null;
};

export default function DonutChart({ data = [], innerRadius = 60, outerRadius = 90, height = 240 }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-sans text-xs text-[var(--muted)] uppercase tracking-widest">Total</span>
        <span className="font-serif text-lg text-[var(--ink)]">{formatBRL(total)}</span>
      </div>
    </div>
  );
}
