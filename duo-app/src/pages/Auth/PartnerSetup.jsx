import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PARTNER_COLORS } from '../../utils/categories';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function PartnerSetup() {
  const { appUser, couple, loadUserData } = useAuthStore();
  const [name, setName] = useState(appUser?.name || '');
  const [selectedColor, setSelectedColor] = useState('#1D9E75');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const partner1Color = couple?.partner1_color || '#D4537E';

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Digite seu nome');
    setLoading(true);
    try {
      await supabase
        .from('app_users')
        .update({ name: name.trim(), color: selectedColor })
        .eq('id', appUser.id);

      await supabase
        .from('couples')
        .update({
          partner2_name: name.trim(),
          partner2_color: selectedColor,
        })
        .eq('id', couple.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) await loadUserData(session);

      useAuthStore.setState({ needsProfileSetup: false });

      toast.success(`Bem-vindo(a) ao Duo, ${name}! 🎉`);
      navigate('/dashboard');
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--surface)] flex flex-col">
      <div className="bg-[var(--rose-light)] px-6 pt-16 pb-8">
        <h1 className="font-serif text-3xl text-[var(--ink)] mb-2">Seu perfil no casal</h1>
        <p className="text-sm text-[var(--muted)]">Escolha como você vai aparecer no Duo</p>
      </div>

      <div className="flex-1 px-6 py-8 space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1.5 uppercase tracking-wide">Seu nome</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Como quer ser chamado(a)?"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--rose)] transition-colors"
          />
        </div>

        {/* Cor */}
        <div>
          <p className="text-xs font-medium text-[var(--ink-soft)] mb-3 uppercase tracking-wide">Sua cor no app</p>
          <div className="flex gap-3 flex-wrap">
            {PARTNER_COLORS.map((c) => {
              const isPartner1Color = c.value === partner1Color;
              const isSelected = c.value === selectedColor;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    if (isPartner1Color) {
                      toast('Seu parceiro(a) já escolheu essa cor', { icon: '🎨', style: { fontSize: '14px' } });
                      return;
                    }
                    setSelectedColor(c.value);
                  }}
                  className={`w-10 h-10 rounded-full transition-all relative ${isSelected ? 'ring-2 ring-offset-2 scale-110' : ''} ${isPartner1Color ? 'opacity-30' : 'opacity-90 hover:opacity-100'}`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                >
                  {isPartner1Color && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">✕</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-4 h-4 rounded-full opacity-30 border border-gray-300" style={{ backgroundColor: partner1Color }} />
            <p className="text-xs text-[var(--muted)]">Cor já escolhida pelo seu parceiro(a)</p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-2xl bg-white border border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] mb-3 uppercase tracking-wide font-medium">Preview do casal</p>
          <div className="flex items-center gap-3">
            <div className="flex">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm border-2 border-white shadow"
                style={{ backgroundColor: partner1Color }}
              >
                {couple?.partner1_name?.[0] || '?'}
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm border-2 border-white shadow -ml-2"
                style={{ backgroundColor: selectedColor }}
              >
                {name?.[0] || '?'}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">{couple?.name}</p>
              <p className="text-xs text-[var(--muted)]">{couple?.partner1_name} & {name || 'você'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 border-t border-[var(--border)] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-4 bg-[var(--rose)] text-white rounded-xl font-medium text-base disabled:opacity-60 shadow-[0_4px_16px_rgba(212,83,126,0.3)]"
        >
          {loading ? 'Salvando...' : 'Entrar no Duo →'}
        </button>
      </div>
    </div>
  );
}
