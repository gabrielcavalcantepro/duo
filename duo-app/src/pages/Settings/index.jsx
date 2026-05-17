import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Wallet, Trash2, Download, ChevronRight, Copy, LogOut } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { CurrencyInput } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { PARTNER_COLORS } from '../../utils/categories';
import toast from 'react-hot-toast';

export default function Settings() {
  const { couple, updateCouple, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [form, setForm] = useState({
    name: couple?.name || '',
    partner1Name: couple?.partner1Name || '',
    partner1Color: couple?.partner1Color || '#D4537E',
    partner2Name: couple?.partner2Name || '',
    partner2Color: couple?.partner2Color || '#1D9E75',
    closingDay: couple?.closingDay || 5,
    salary1: couple?.salary1 || 0,
    salary2: couple?.salary2 || 0,
    monthlySavingsGoal: couple?.monthlySavingsGoal || 0,
  });

  useEffect(() => {
    if (couple) {
      setForm({
        name: couple.name || '',
        partner1Name: couple.partner1Name || '',
        partner1Color: couple.partner1Color || '#D4537E',
        partner2Name: couple.partner2Name || '',
        partner2Color: couple.partner2Color || '#1D9E75',
        closingDay: couple.closingDay || 5,
        salary1: couple.salary1 || 0,
        salary2: couple.salary2 || 0,
        monthlySavingsGoal: couple.monthlySavingsGoal || 0,
      });
    }
  }, [couple]);

  const handleSaveProfile = async () => {
    await updateCouple({
      name: form.name,
      partner1Name: form.partner1Name,
      partner1Color: form.partner1Color,
      partner2Name: form.partner2Name,
      partner2Color: form.partner2Color,
    });
    toast.success('Perfil atualizado!');
    setShowProfile(false);
  };

  const handleSaveFinance = async () => {
    await updateCouple({
      closingDay: Number(form.closingDay),
      salary1: form.salary1,
      salary2: form.salary2,
      monthlySavingsGoal: form.monthlySavingsGoal,
    });
    toast.success('Configurações financeiras salvas!');
    setShowFinance(false);
  };

  const handleExport = async () => {
    try {
      const coupleId = couple?.id;
      if (!coupleId) return;

      const [t, g, gc, b, m, cd, sb] = await Promise.all([
        supabase.from('transactions').select('*').eq('couple_id', coupleId),
        supabase.from('goals').select('*').eq('couple_id', coupleId),
        supabase.from('goal_contributions').select('*').eq('couple_id', coupleId),
        supabase.from('budgets').select('*').eq('couple_id', coupleId),
        supabase.from('meetings').select('*').eq('couple_id', coupleId),
        supabase.from('challenge_days').select('*').eq('couple_id', coupleId),
        supabase.from('split_bills').select('*').eq('couple_id', coupleId),
      ]);

      const data = {
        couple,
        transactions: t.data || [],
        goals: g.data || [],
        goalContributions: gc.data || [],
        budgets: b.data || [],
        meetings: m.data || [],
        challengeDays: cd.data || [],
        splitBills: sb.data || [],
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `duo-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Dados exportados!');
    } catch {
      toast.error('Erro ao exportar dados');
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setShowLogoutConfirm(false);
    navigate('/auth');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couple?.invite_code || '');
    toast.success('Código copiado!');
  };

  const SETTINGS_SECTIONS = [
    { icon: User, label: 'Perfil do casal', sub: couple?.name || '', onClick: () => setShowProfile(true) },
    { icon: Wallet, label: 'Configurações financeiras', sub: `Fechamento: dia ${couple?.closingDay || '—'}`, onClick: () => setShowFinance(true) },
  ];

  return (
    <div className="page-content">
      <TopBar title="Configurações" showBack />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {/* Profile preview */}
        {couple && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="text-center">
              <div className="flex justify-center gap-[-8px] mb-3">
                {[
                  { name: couple.partner1Name, color: couple.partner1Color },
                  { name: couple.partner2Name, color: couple.partner2Color },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold ring-4 ring-white"
                    style={{ backgroundColor: p.color, marginLeft: i > 0 ? '-8px' : '0' }}
                  >
                    {p.name?.[0] || '?'}
                  </div>
                ))}
              </div>
              <h2 className="font-serif text-2xl text-[var(--ink)]">{couple.name}</h2>
              <p className="font-sans text-sm text-[var(--muted)]">{couple.partner1Name} & {couple.partner2Name || '—'}</p>
            </Card>
          </motion.div>
        )}

        {/* Invite code */}
        {couple?.invite_code && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="bg-[var(--rose-light)] rounded-2xl p-5 border-2 border-dashed border-[var(--rose-mid)]">
              <p className="text-xs font-medium text-[var(--rose-dark)] uppercase tracking-wide mb-1">Código do casal</p>
              <p className="font-mono text-2xl font-bold text-[var(--rose)] tracking-widest mb-2">{couple.invite_code}</p>
              <p className="text-xs text-[var(--muted)] mb-3">Compartilhe com seu parceiro(a) para ele(a) entrar no Duo junto com você</p>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-sm text-[var(--rose)] font-medium hover:opacity-70 transition-opacity"
              >
                <Copy size={14} /> Copiar código
              </button>
            </div>
          </motion.div>
        )}

        {/* Settings items */}
        <div className="space-y-2">
          {SETTINGS_SECTIONS.map(({ icon: Icon, label, sub, onClick }) => (
            <motion.button
              key={label}
              onClick={onClick}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-card shadow-card border border-[var(--border)] hover:shadow-rose transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--rose-light)] flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[var(--rose)]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">{label}</p>
                {sub && <p className="font-sans text-xs text-[var(--muted)]">{sub}</p>}
              </div>
              <ChevronRight size={16} className="text-[var(--muted)]" />
            </motion.button>
          ))}
        </div>

        {/* Data section */}
        <div className="space-y-2">
          <p className="label-sm px-1">Dados</p>
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-card shadow-card border border-[var(--border)] hover:shadow-rose transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--teal-light)] flex items-center justify-center">
              <Download size={18} className="text-[var(--teal)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">Exportar dados</p>
              <p className="font-sans text-xs text-[var(--muted)]">Baixar backup em JSON</p>
            </div>
            <ChevronRight size={16} className="text-[var(--muted)]" />
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-card shadow-card border border-red-100 hover:border-red-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut size={18} className="text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-sans text-sm font-medium text-red-600">Sair da conta</p>
              <p className="font-sans text-xs text-red-400">Você precisará fazer login novamente</p>
            </div>
          </button>
        </div>

        <div className="text-center py-4">
          <p className="font-sans text-xs text-[var(--muted)]">Duo v1.0.0 · Finanças que fortalecem o casal</p>
        </div>
      </div>

      {/* Profile modal */}
      <Modal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        title="Editar perfil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowProfile(false)} fullWidth>Cancelar</Button>
            <Button onClick={handleSaveProfile} fullWidth>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome do casal" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <div className="space-y-3">
            <Input label="Nome — Pessoa 1" value={form.partner1Name} onChange={(e) => setForm((f) => ({ ...f, partner1Name: e.target.value }))} />
            <div>
              <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Cor — {form.partner1Name}</p>
              <div className="flex gap-2.5">
                {PARTNER_COLORS.map((c) => (
                  <button key={c.value} onClick={() => { if (c.value !== form.partner2Color) setForm((f) => ({ ...f, partner1Color: c.value })); }}
                    className={`w-8 h-8 rounded-full transition-all ${form.partner1Color === c.value ? 'ring-2 ring-offset-2' : ''} ${c.value === form.partner2Color ? 'opacity-30 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Input label="Nome — Pessoa 2" value={form.partner2Name} onChange={(e) => setForm((f) => ({ ...f, partner2Name: e.target.value }))} />
            <div>
              <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Cor — {form.partner2Name}</p>
              <div className="flex gap-2.5">
                {PARTNER_COLORS.map((c) => (
                  <button key={c.value} onClick={() => { if (c.value !== form.partner1Color) setForm((f) => ({ ...f, partner2Color: c.value })); }}
                    className={`w-8 h-8 rounded-full transition-all ${form.partner2Color === c.value ? 'ring-2 ring-offset-2' : ''} ${c.value === form.partner1Color ? 'opacity-30 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Finance modal */}
      <Modal
        open={showFinance}
        onClose={() => setShowFinance(false)}
        title="Configurações financeiras"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowFinance(false)} fullWidth>Cancelar</Button>
            <Button onClick={handleSaveFinance} fullWidth>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="font-sans text-sm font-medium text-[var(--ink-soft)] block mb-1">Dia de fechamento do mês</label>
            <select
              value={form.closingDay}
              onChange={(e) => setForm((f) => ({ ...f, closingDay: Number(e.target.value) }))}
              className="w-full rounded-element border border-[var(--border)] bg-white px-4 py-3 font-sans focus:border-[var(--rose)] focus:ring-2 focus:ring-[var(--rose)]/20 outline-none"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Dia {d}</option>)}
            </select>
          </div>
          <CurrencyInput label={`Salário — ${form.partner1Name}`} value={form.salary1} onChange={(v) => setForm((f) => ({ ...f, salary1: v }))} />
          <CurrencyInput label={`Salário — ${form.partner2Name}`} value={form.salary2} onChange={(v) => setForm((f) => ({ ...f, salary2: v }))} />
          <CurrencyInput label="Meta de poupança mensal" value={form.monthlySavingsGoal} onChange={(v) => setForm((f) => ({ ...f, monthlySavingsGoal: v }))} />
        </div>
      </Modal>

      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sair da conta"
        message="Você será desconectado e precisará fazer login novamente para acessar o Duo. Seus dados ficam salvos na nuvem."
        danger
        loading={loggingOut}
      />
    </div>
  );
}
