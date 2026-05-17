import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, LogOut, Lock, Palette, User, ChevronRight, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { PARTNER_COLORS } from '../../utils/categories';
import toast from 'react-hot-toast';

export default function Profile() {
  const { appUser, couple, logout, loadUserData } = useAuthStore();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(appUser?.name || '');
  const [selectedColor, setSelectedColor] = useState(appUser?.color || '#D4537E');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const isPartner1 = !appUser?.is_partner;
  const partnerColor = isPartner1 ? couple?.partner2_color : couple?.partner1_color;

  const handleSave = async () => {
    setLoading(true);
    try {
      await supabase
        .from('app_users')
        .update({ name: name.trim(), color: selectedColor })
        .eq('id', appUser.id);

      const field = isPartner1
        ? { partner1_name: name.trim(), partner1_color: selectedColor }
        : { partner2_name: name.trim(), partner2_color: selectedColor };

      await supabase.from('couples').update(field).eq('id', couple.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) await loadUserData(session);

      toast.success('Perfil atualizado!');
      setEditingName(false);
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const memberSince = appUser?.created_at
    ? new Date(appUser.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-dvh bg-[var(--surface)] pb-24">
      {/* Header */}
      <div className="bg-[var(--rose-light)] px-6 pt-14 pb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[var(--muted)] mb-6 hover:text-[var(--rose)] transition-colors">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-medium shadow-lg"
              style={{ backgroundColor: selectedColor }}
            >
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center border border-[var(--border)] hover:bg-[var(--rose-light)] transition-colors"
            >
              <Camera size={14} className="text-[var(--rose)]" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" />
          </div>
          <h1 className="font-serif text-2xl text-[var(--ink)]">{name}</h1>
          <p className="text-xs text-[var(--muted)] mt-1">Membro desde {memberSince}</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Nome */}
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--rose-light)] flex items-center justify-center">
                <User size={16} className="text-[var(--rose)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--muted)] uppercase tracking-wide font-medium">Seu nome</p>
                {editingName ? (
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="text-sm text-[var(--ink)] border-b border-[var(--rose)] outline-none bg-transparent mt-0.5"
                    autoFocus
                  />
                ) : (
                  <p className="text-sm font-medium text-[var(--ink)]">{name}</p>
                )}
              </div>
            </div>
            {editingName ? (
              <button onClick={handleSave} disabled={loading} className="text-xs font-medium text-[var(--rose)]">
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            ) : (
              <button onClick={() => setEditingName(true)} className="text-xs font-medium text-[var(--rose)]">
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Cor */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[var(--rose-light)] flex items-center justify-center">
              <Palette size={16} className="text-[var(--rose)]" />
            </div>
            <p className="text-sm font-medium text-[var(--ink)]">Sua cor no app</p>
          </div>
          <div className="flex gap-2.5 flex-wrap ml-12">
            {PARTNER_COLORS.map((c) => {
              const isPartnerColor = c.value === partnerColor;
              const isSelected = c.value === selectedColor;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    if (isPartnerColor) {
                      toast('Seu parceiro(a) já escolheu essa cor', { icon: '🎨' });
                      return;
                    }
                    setSelectedColor(c.value);
                  }}
                  className={`w-8 h-8 rounded-full transition-all ${isSelected ? 'ring-2 ring-offset-2 scale-110' : ''} ${isPartnerColor ? 'opacity-30' : 'opacity-90'}`}
                  style={{ backgroundColor: c.value }}
                />
              );
            })}
          </div>
          {selectedColor !== appUser?.color && (
            <button onClick={handleSave} disabled={loading} className="mt-3 ml-12 text-xs font-medium text-[var(--rose)]">
              {loading ? 'Salvando...' : 'Salvar cor'}
            </button>
          )}
        </div>

        {/* Segurança */}
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--rose-light)] flex items-center justify-center">
                <Lock size={16} className="text-[var(--rose)]" />
              </div>
              <p className="text-sm font-medium text-[var(--ink)]">Alterar senha</p>
            </div>
            <ChevronRight size={16} className="text-[var(--muted)]" />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--rose-light)] flex items-center justify-center">
                <Shield size={16} className="text-[var(--rose)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">Email</p>
                <p className="text-xs text-[var(--muted)]">{appUser?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sair */}
        <button
          onClick={handleLogout}
          className="w-full p-4 bg-white rounded-2xl border border-[var(--border)] flex items-center gap-3 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <LogOut size={16} className="text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-500">Sair da conta</span>
        </button>
      </div>
    </div>
  );
}
