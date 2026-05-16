import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Welcome from './Welcome';
import CoupleSetup from './CoupleSetup';
import FirstGoal from './FirstGoal';
import useAuthStore from '../../store/authStore';
import useGoalStore from '../../store/goalStore';
import db, { seedDemoData } from '../../db/database';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [coupleData, setCoupleData] = useState(null);
  const navigate = useNavigate();
  const { setCouple, setActiveUser } = useAuthStore();
  const { loadGoals } = useGoalStore();

  const handleWelcome = () => setStep(1);

  const handleDemo = async () => {
    await seedDemoData();
    const couples = await db.couple.toArray();
    if (couples[0]) {
      setCouple(couples[0]);
      setActiveUser(couples[0].partner1Name);
    }
    navigate('/dashboard');
  };

  const handleCoupleSetup = async (data) => {
    const id = await db.couple.add({
      ...data,
      currency: 'BRL',
      createdAt: new Date().toISOString(),
    });
    const couple = await db.couple.get(id);
    setCouple(couple);
    setActiveUser(couple.partner1Name);
    setCoupleData(couple);
    setStep(2);
  };

  const handleGoal = async (goalData) => {
    if (goalData) {
      await db.goals.add({
        ...goalData,
        currentAmount: 0,
        priority: 'alta',
        color: '#D4537E',
        createdAt: new Date().toISOString(),
      });
      await loadGoals();
    }
    toast.success(`Bem-vindos ao Duo, ${coupleData?.name || 'casal'}!`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-dvh bg-[var(--surface)] flex flex-col">
      <AnimatePresence mode="wait">
        {step === 0 && <Welcome key="welcome" onNext={handleWelcome} onDemo={handleDemo} />}
        {step === 1 && <CoupleSetup key="setup" onNext={handleCoupleSetup} />}
        {step === 2 && <FirstGoal key="goal" couple={coupleData} onNext={handleGoal} />}
      </AnimatePresence>
    </div>
  );
}
