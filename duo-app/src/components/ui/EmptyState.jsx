import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, subtitle, action, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6 gap-4"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[var(--rose-light)] flex items-center justify-center">
          <Icon size={28} className="text-[var(--rose)]" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-serif text-xl text-[var(--ink)]">{title}</h3>
        {subtitle && <p className="font-sans text-sm text-[var(--muted)] max-w-xs">{subtitle}</p>}
      </div>
      {action && actionLabel && (
        <Button onClick={action} size="md">{actionLabel}</Button>
      )}
    </motion.div>
  );
}
