import { motion } from 'framer-motion';

const variants = {
  default: 'bg-[var(--card)] shadow-card border border-[var(--border)]',
  rose:    'bg-[var(--rose)] text-white',
  teal:    'bg-[var(--teal-light)] text-[var(--teal-dark)]',
  muted:   'bg-[var(--surface)]',
  glass:   'glass border border-[var(--border)]',
};

export default function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  animate = false,
  padding = 'p-5',
  ...props
}) {
  const base = [
    'rounded-card overflow-hidden',
    variants[variant] || variants.default,
    padding,
    onClick ? 'cursor-pointer' : '',
    className,
  ].join(' ');

  if (animate || onClick) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        whileHover={onClick ? { scale: 1.005 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={base} {...props}>
      {children}
    </div>
  );
}
