import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input, { CurrencyInput } from '../ui/Input';
import useGoalStore from '../../store/goalStore';
import { GOAL_EMOJIS } from '../../utils/categories';

const GOAL_COLORS = [
  '#D4537E','#1D9E75','#8B5CF6','#F59E0B','#3B82F6','#F97316',
];

const schema = z.object({
  name: z.string().min(1, 'Informe o nome da meta'),
  emoji: z.string().min(1, 'Selecione um emoji'),
  targetAmount: z.number().positive('Informe o valor alvo'),
  currentAmount: z.number().min(0).optional(),
  deadline: z.string().min(1, 'Informe a data limite'),
  color: z.string().min(1),
  priority: z.enum(['alta', 'média', 'baixa']),
});

export default function GoalForm({ open, onClose, defaultValues }) {
  const { addGoal, updateGoal } = useGoalStore();

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: '',
      emoji: '🎯',
      targetAmount: 0,
      currentAmount: 0,
      deadline: '',
      color: '#D4537E',
      priority: 'média',
    },
  });

  const emoji = watch('emoji');
  const color = watch('color');
  const priority = watch('priority');

  const onSubmit = async (data) => {
    try {
      if (defaultValues?.id) {
        await updateGoal(defaultValues.id, data);
        toast.success('Meta atualizada!');
      } else {
        await addGoal(data);
        toast.success('Meta criada!');
      }
      reset();
      onClose();
    } catch {
      toast.error('Erro ao salvar meta.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={defaultValues?.id ? 'Editar meta' : 'Nova meta'}
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }} fullWidth>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth>
            {defaultValues?.id ? 'Salvar' : 'Criar meta'}
          </Button>
        </>
      }
    >
      <form className="space-y-5">
        {/* Emoji */}
        <div>
          <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Emoji da meta</p>
          <div className="grid grid-cols-8 gap-1.5">
            {GOAL_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setValue('emoji', e)}
                className={`text-xl p-1.5 rounded-element transition-all ${emoji === e ? 'bg-[var(--rose-light)] ring-2 ring-[var(--rose)]' : 'hover:bg-gray-50'}`}
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
          render={({ field }) => (
            <Input label="Nome da meta" placeholder="Ex: Viagem para Europa" error={errors.name?.message} {...field} />
          )}
        />

        {/* Target amount */}
        <Controller
          name="targetAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput label="Valor alvo" value={field.value} onChange={field.onChange} error={errors.targetAmount?.message} />
          )}
        />

        {/* Current amount */}
        <Controller
          name="currentAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput label="Valor inicial (opcional)" value={field.value} onChange={field.onChange} />
          )}
        />

        {/* Deadline */}
        <Controller
          name="deadline"
          control={control}
          render={({ field }) => (
            <Input label="Data limite" type="date" error={errors.deadline?.message} {...field} />
          )}
        />

        {/* Color */}
        <div>
          <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Cor do tema</p>
          <div className="flex gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                style={{ backgroundColor: c, ringColor: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Prioridade</p>
          <div className="flex gap-2">
            {['alta', 'média', 'baixa'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setValue('priority', p)}
                className={`flex-1 py-2 rounded-pill text-sm font-sans font-medium transition-all capitalize ${
                  priority === p ? 'bg-[var(--rose)] text-white' : 'border border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
