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
  const { appUser, setCouple, setActiveUser, generateInviteCode } = useAuthStore();

  const handleWelcome = () => setStep(1);

  const handleCoupleSetup = async (data) => {
    if (!appUser?.id) {
      toast.error('Usuário não encontrado. Tente fazer login novamente.');
      return;
    }

    const inviteCode = generateInviteCode();

    const insertPayload = {
      name: data.name,
      closing_day: data.closingDay || 5,
      salary1: data.salary1 || 0,
      salary2: data.salary2 || 0,
      monthly_savings_goal: data.monthlySavingsGoal || 0,
      partner1_id: appUser.id,
      invite_code: inviteCode,
      currency: 'BRL',
    };

    console.log('[handleCoupleSetup] appUser.id:', appUser.id);
    console.log('[handleCoupleSetup] insert payload:', insertPayload);

    const { data: couple, error } = await supabase
      .from('couples')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[handleCoupleSetup] Supabase error:', error);
      toast.error('Erro ao criar o casal. Tente novamente.');
      return;
    }

    await supabase
      .from('app_users')
      .update({ couple_id: couple.id, color: data.partner1Color || '#D4537E', name: data.partner1Name || appUser.name })
      .eq('id', appUser.id);

    const enrichedCouple = {
      ...couple,
      partner1_name: data.partner1Name || appUser.name,
      partner1_color: data.partner1Color || '#D4537E',
      partner2_name: data.partner2Name || '',
      partner2_color: data.partner2Color || '#1D9E75',
    };
    setCouple(enrichedCouple);
    setActiveUser(data.partner1Name || appUser.name);
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
