import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CurrencyInput } from '../ui/Input';
import useBudgetStore from '../../store/budgetStore';
import { EXPENSE_CATEGORIES } from '../../utils/categories';
import * as Icons from 'lucide-react';

const schema = z.object({
  category: z.string().min(1, 'Selecione uma categoria'),
  limit: z.number().positive('Informe o valor'),
});

export default function BudgetForm({ open, onClose, month, year, existingCategory }) {
  const { setBudget } = useBudgetStore();

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category: existingCategory || '', limit: 0 },
  });

  const category = watch('category');

  const onSubmit = async (data) => {
    try {
      await setBudget(month, year, data.category, data.limit);
      toast.success('Orçamento definido!');
      reset();
      onClose();
    } catch {
      toast.error('Erro ao salvar orçamento.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Definir orçamento"
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }} fullWidth>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth>Salvar</Button>
        </>
      }
    >
      <form className="space-y-5">
        {!existingCategory && (
          <div>
            <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Categoria</p>
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => {
                const IconComp = Icons[cat.icon] || Icons.MoreHorizontal;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setValue('category', cat.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-element text-sm font-sans transition-all ${
                      isSelected ? 'bg-[var(--rose-light)] border-2 border-[var(--rose)]' : 'border border-[var(--border)]'
                    }`}
                  >
                    <IconComp size={16} color={isSelected ? 'var(--rose)' : cat.color} />
                    <span className="truncate text-xs">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="text-sm text-[var(--rose-dark)] mt-1">{errors.category.message}</p>}
          </div>
        )}

        <Controller
          name="limit"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label={`Limite mensal${existingCategory ? ` — ${existingCategory}` : ''}`}
              value={field.value}
              onChange={field.onChange}
              error={errors.limit?.message}
            />
          )}
        />
      </form>
    </Modal>
  );
}
