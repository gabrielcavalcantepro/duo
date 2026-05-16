const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-13 h-13 text-base',
};

export default function Avatar({ name = '', color = '#D4537E', size = 'md', src, className = '' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const sizeClass = sizes[size] || sizes.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-sans font-semibold text-white ring-2 ring-white flex-shrink-0 ${className}`}
      style={{ backgroundColor: color }}
      aria-label={name}
      title={name}
    >
      {initials || '?'}
    </div>
  );
}
