import { forwardRef } from 'react';
import { formatBRL } from '../../utils/formatters';

const Input = forwardRef(function Input(
  {
    label,
    error,
    type = 'text',
    className = '',
    variant = 'text',
    prefix,
    suffix,
    helpText,
    ...props
  },
  ref
) {
  const base =
    'w-full rounded-element border bg-white px-4 py-3 font-sans text-base text-[var(--ink)] outline-none transition-all duration-200 placeholder:text-[var(--muted)] focus:border-[var(--rose)] focus:ring-2 focus:ring-[var(--rose)]/20';
  const borderClass = error
    ? 'border-[var(--rose-dark)] ring-2 ring-[var(--rose-dark)]/20'
    : 'border-[var(--border)]';

  const inputType = variant === 'currency' ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="font-sans text-sm font-medium text-[var(--ink-soft)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[var(--muted)] font-medium select-none">{prefix}</span>
        )}
        {variant === 'textarea' ? (
          <textarea
            ref={ref}
            className={`${base} ${borderClass} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} resize-none min-h-[100px]`}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={inputType}
            className={`${base} ${borderClass} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
            {...props}
          />
        )}
        {suffix && (
          <span className="absolute right-3 text-[var(--muted)] select-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-sm text-[var(--rose-dark)] font-sans">{error}</p>}
      {helpText && !error && <p className="text-xs text-[var(--muted)]">{helpText}</p>}
    </div>
  );
});

export function CurrencyInput({ value, onChange, label, error, className, placeholder = '0,00', ...props }) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(raw || '0', 10) / 100;
    onChange(numValue);
  };

  const display = value
    ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : '';

  return (
    <Input
      label={label}
      error={error}
      type="text"
      prefix="R$"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      inputMode="numeric"
      className={className}
      {...props}
    />
  );
}

export default Input;
