import { motion } from 'framer-motion';

const colorMap = {
  rose:  'bg-[var(--rose)]',
  teal:  'bg-[var(--teal)]',
  amber: 'bg-amber-400',
  blue:  'bg-blue-500',
};

export default function ProgressBar({
  value = 0,
  total = 100,
  color = 'rose',
  showLabel = false,
  showValues = false,
  height = 'h-2',
  className = '',
  formatValue,
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  const barColor = colorMap[color] || color;

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || showValues) && (
        <div className="flex justify-between items-center mb-1">
          {showLabel && (
            <span className="text-xs text-[var(--muted)] font-sans">{Math.round(pct)}%</span>
          )}
          {showValues && formatValue && (
            <span className="text-xs text-[var(--muted)] font-sans">
              {formatValue(value)} / {formatValue(total)}
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-gray-100 overflow-hidden`}>
        <motion.div
          className={`${height} rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
