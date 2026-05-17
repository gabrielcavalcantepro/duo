import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Welcome from './Welcome';
import CoupleSetup from './CoupleSetup';
import FirstGoal from './FirstGoal';
import InviteCodeModal from '../../components/ui/InviteCodeModal';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [coupleData, setCoupleData] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();
  const { setCouple, setActiveUser } = useAuthStore();

  const handleWelcome = () => setStep(1);

  const handleCoupleSetup = async (data) => {
    let currentAppUser = useAuthStore.getState().appUser;

    if (!currentAppUser?.id) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/auth');
        return;
      }
      const { data: freshUser } = await supabase
        .from('app_users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (!freshUser) {
        toast.error('Usuário não encontrado. Tente fazer login novamente.');
        navigate('/auth');
        return;
      }
      currentAppUser = freshUser;
      useAuthStore.setState({ appUser: freshUser });
    }

    const inviteCode = useAuthStore.getState().generateInviteCode();

    const { data: couple, error } = await supabase
      .from('couples')
      .insert({
        name: data.name,
        partner1_id: currentAppUser.id,
        invite_code: inviteCode,
        currency: 'BRL',
        closing_day: data.closingDay,
        partner1_name: data.partner1Name,
        partner1_color: data.partner1Color,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar o casal. Tente novamente.');
      console.error(error);
      return;
    }

    await supabase
      .from('app_users')
      .update({
        couple_id: couple.id,
        color: data.partner1Color,
        name: data.partner1Name,
      })
      .eq('id', currentAppUser.id);

    const enrichedCouple = {
      ...couple,
      partner1_name: data.partner1Name,
      partner1_color: data.partner1Color,
      partner2_name: '',
      partner2_color: '#1D9E75',
    };
    setCouple(enrichedCouple);
    setActiveUser(data.partner1Name);
    setCoupleData(enrichedCouple);
    setInviteCode(couple.invite_code);
    setStep(2);
  };

  const handleGoal = async (goalData) => {
    if (goalData && coupleData) {
      await supabase.from('goals').insert({
        name: goalData.name,
        emoji: goalData.emoji || '🎯',
        target_amount: goalData.targetAmount,
        current_amount: 0,
        deadline: goalData.deadline || null,
        color: '#D4537E',
        priority: 'alta',
        couple_id: coupleData.id,
      });
    }
    const coupleName = coupleData?.name || coupleData?.partner1_name || 'casal';
    toast.success(`Bem-vindos ao Duo, ${coupleName}! 🎉`);
    setShowInviteModal(true);
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-dvh bg-[var(--surface)] flex flex-col">
      <AnimatePresence mode="wait">
        {step === 0 && <Welcome key="welcome" onNext={handleWelcome} />}
        {step === 1 && <CoupleSetup key="setup" onNext={handleCoupleSetup} />}
        {step === 2 && <FirstGoal key="goal" couple={coupleData} onNext={handleGoal} />}
      </AnimatePresence>

      {showInviteModal && (
        <InviteCodeModal
          code={inviteCode}
          onClose={handleCloseInviteModal}
        />
      )}
    </div>
  );
}
