import { motion } from 'framer-motion';

const variants = {
  primary:   'bg-[var(--rose)] text-white hover:bg-[var(--rose-dark)] shadow-rose',
  secondary: 'border-2 border-[var(--rose)] text-[var(--rose)] hover:bg-[var(--rose-light)]',
  ghost:     'text-[var(--rose)] hover:bg-[var(--rose-light)]',
  danger:    'bg-[var(--rose-dark)] text-white hover:opacity-90',
  success:   'bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)]',
  muted:     'bg-gray-100 text-[var(--ink-soft)] hover:bg-gray-200',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      aria-label={props['aria-label']}
      className={[
        'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-pill transition-all duration-200',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth ? 'w-full' : '',
        disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
}
