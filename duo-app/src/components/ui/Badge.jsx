const variants = {
  rose:    'bg-[var(--rose-light)] text-[var(--rose-dark)]',
  teal:    'bg-[var(--teal-light)] text-[var(--teal-dark)]',
  amber:   'bg-amber-50 text-amber-700',
  success: 'bg-emerald-50 text-emerald-700',
  muted:   'bg-gray-100 text-[var(--muted)]',
  ink:     'bg-[var(--ink)] text-white',
};

export default function Badge({ children, variant = 'rose', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-medium font-sans ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
