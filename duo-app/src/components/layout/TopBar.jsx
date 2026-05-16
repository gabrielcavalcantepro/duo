import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TopBar({ title, showBack = false, actions, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 pt-[env(safe-area-inset-top,0px)]">
      {showBack && (
        <button
          onClick={handleBack}
          aria-label="Voltar"
          className="p-2 -ml-2 rounded-full hover:bg-[var(--rose-light)] transition-colors text-[var(--ink-soft)]"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="font-serif text-lg text-[var(--ink)] flex-1 truncate">{title}</h1>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}
