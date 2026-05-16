import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Input, { CurrencyInput } from '../../components/ui/Input';
import { GOAL_EMOJIS } from '../../utils/categories';

export default function FirstGoal({ couple, onNext }) {
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      emoji: '✈️',
      targetAmount: 0,
      deadline: '',
    },
  });

  const emoji = watch('emoji');

  const handleSkip = () => onNext(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="flex-1 flex flex-col min-h-dvh"
    >
      {/* Header */}
      <div className="bg-[var(--teal-light)] px-6 pt-16 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--teal)] flex items-center justify-center text-white text-lg">3</div>
          <div className="h-1 flex-1 rounded-full bg-[var(--teal)]/30">
            <div className="h-1 bg-[var(--teal)] rounded-full w-full" />
          </div>
        </div>
        <h1 className="font-serif text-3xl text-[var(--ink)] mb-2">
          Qual é o primeiro sonho de vocês?
        </h1>
        <p className="font-sans text-sm text-[var(--teal-dark)]">
          Toda grande jornada começa com um primeiro objetivo.
        </p>
      </div>

      <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
        {/* Emoji */}
        <div>
          <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Escolha um emoji</p>
          <div className="grid grid-cols-8 gap-2">
            {GOAL_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setValue('emoji', e)}
                className={`text-2xl p-2 rounded-element transition-all ${emoji === e ? 'bg-[var(--rose-light)] ring-2 ring-[var(--rose)]' : 'hover:bg-gray-50'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Dê um nome para a meta' }}
          render={({ field }) => (
            <Input
              label="Nome do sonho"
              placeholder="Ex: Viagem para Portugal"
              error={errors.name?.message}
              {...field}
            />
          )}
        />

        {/* Target */}
        <Controller
          name="targetAmount"
          control={control}
          rules={{ validate: (v) => v > 0 || 'Informe o valor' }}
          render={({ field }) => (
            <CurrencyInput
              label="Quanto vocês precisam?"
              value={field.value}
              onChange={field.onChange}
              error={errors.targetAmount?.message}
            />
          )}
        />

        {/* Deadline */}
        <Controller
          name="deadline"
          control={control}
          rules={{ required: 'Informe a data' }}
          render={({ field }) => (
            <Input
              label="Para quando?"
              type="date"
              error={errors.deadline?.message}
              {...field}
            />
          )}
        />
      </div>

      <div className="px-6 py-6 space-y-3 border-t border-[var(--border)] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <Button onClick={handleSubmit((data) => onNext(data))} loading={isSubmitting} fullWidth size="lg" variant="success">
          Criar nossa primeira meta →
        </Button>
        <button onClick={handleSkip} className="w-full py-2 font-sans text-sm text-[var(--muted)] hover:text-[var(--ink-soft)] transition-colors">
          Fazer isso depois
        </button>
      </div>
    </motion.div>
  );
}
