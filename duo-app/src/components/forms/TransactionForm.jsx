import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import * as Icons from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input, { CurrencyInput } from '../ui/Input';
import Avatar from '../ui/Avatar';
import useTransactionStore from '../../store/transactionStore';
import useAuthStore from '../../store/authStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryByName } from '../../utils/categories';
import { formatDate } from '../../utils/formatters';

const schema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.number({ invalid_type_error: 'Informe o valor' }).positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Informe a descrição'),
  category: z.string().min(1, 'Selecione uma categoria'),
  paidBy: z.string().min(1, 'Selecione quem pagou'),
  date: z.string().min(1, 'Informe a data'),
  isShared: z.boolean().optional(),
  note: z.string().optional(),
  installments: z.number().optional(),
  installmentCurrent: z.number().optional(),
});

export default function TransactionForm({ open, onClose, defaultValues }) {
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { couple } = useAuthStore();
  const [isInstallment, setIsInstallment] = useState(false);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      type: 'expense',
      amount: 0,
      description: '',
      category: '',
      paidBy: couple?.partner1Name || '',
      date: new Date().toISOString().split('T')[0],
      isShared: true,
      note: '',
    },
  });

  const type = watch('type');
  const category = watch('category');
  const paidBy = watch('paidBy');
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
        installments: isInstallment ? data.installments : undefined,
        installmentCurrent: isInstallment ? data.installmentCurrent : undefined,
      };
      if (defaultValues?.id) {
        await updateTransaction(defaultValues.id, payload);
        toast.success('Transação atualizada!');
      } else {
        await addTransaction(payload);
        toast.success('Transação adicionada!');
      }
      reset();
      setIsInstallment(false);
      onClose();
    } catch {
      toast.error('Erro ao salvar transação.');
    }
  };

  const handleClose = () => {
    reset();
    setIsInstallment(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={defaultValues?.id ? 'Editar transação' : 'Nova transação'}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} fullWidth>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth>
            {defaultValues?.id ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Type toggle */}
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div className="flex rounded-pill border border-[var(--border)] p-1 bg-[var(--surface)]">
              {['expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { field.onChange(t); setValue('category', ''); }}
                  className={`flex-1 py-2.5 rounded-pill text-sm font-medium font-sans transition-all duration-200 ${
                    field.value === t
                      ? t === 'expense'
                        ? 'bg-[var(--rose)] text-white shadow-rose'
                        : 'bg-[var(--teal)] text-white'
                      : 'text-[var(--muted)]'
                  }`}
                >
                  {t === 'expense' ? '💸 Despesa' : '💰 Receita'}
                </button>
              ))}
            </div>
          )}
        />

        {/* Amount */}
        <div className="text-center">
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Valor"
                value={field.value}
                onChange={field.onChange}
                error={errors.amount?.message}
              />
            )}
          />
        </div>

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input label="Descrição" placeholder="Ex: Supermercado semanal" error={errors.description?.message} {...field} />
          )}
        />

        {/* Categories */}
        <div>
          <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Categoria</p>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => {
              const IconComp = Icons[cat.icon] || Icons.MoreHorizontal;
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setValue('category', cat.name)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-element transition-all ${
                    isSelected ? 'ring-2 ring-offset-1' : 'hover:bg-gray-50'
                  }`}
                  style={isSelected ? { backgroundColor: `${cat.color}15`, ringColor: cat.color } : {}}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isSelected ? `${cat.color}20` : '#f3f4f6' }}
                  >
                    <IconComp size={18} color={isSelected ? cat.color : 'var(--muted)'} />
                  </div>
                  <span className="text-[10px] font-sans text-center leading-tight text-[var(--muted)] max-w-full">{cat.name}</span>
                </button>
              );
            })}
          </div>
          {errors.category && <p className="text-sm text-[var(--rose-dark)] mt-1">{errors.category.message}</p>}
        </div>

        {/* Paid by */}
        {couple && (
          <div>
            <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Quem pagou</p>
            <div className="flex gap-3">
              {[
                { name: couple.partner1Name, color: couple.partner1Color },
                { name: couple.partner2Name, color: couple.partner2Color },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setValue('paidBy', p.name)}
                  className={`flex-1 flex items-center gap-2 p-3 rounded-element border-2 transition-all ${
                    paidBy === p.name ? 'border-[var(--rose)] bg-[var(--rose-light)]' : 'border-[var(--border)]'
                  }`}
                >
                  <Avatar name={p.name} color={p.color} size="sm" />
                  <span className="font-sans text-sm font-medium text-[var(--ink-soft)]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date */}
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Input label="Data" type="date" error={errors.date?.message} {...field} />
          )}
        />

        {/* Toggles */}
        <div className="space-y-3">
          <Controller
            name="isShared"
            control={control}
            render={({ field }) => (
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">Conta compartilhada</p>
                  <p className="font-sans text-xs text-[var(--muted)]">Entra no saldo do casal</p>
                </div>
                <div
                  onClick={() => field.onChange(!field.value)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${field.value ? 'bg-[var(--rose)]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${field.value ? 'left-7' : 'left-1'}`} />
                </div>
              </label>
            )}
          />

          <label className="flex items-center justify-between cursor-pointer" onClick={() => setIsInstallment((v) => !v)}>
            <div>
              <p className="font-sans text-sm font-medium text-[var(--ink-soft)]">Parcelado</p>
              <p className="font-sans text-xs text-[var(--muted)]">Compra em parcelas</p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${isInstallment ? 'bg-[var(--rose)]' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${isInstallment ? 'left-7' : 'left-1'}`} />
            </div>
          </label>
        </div>

        <AnimatePresence>
          {isInstallment && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-3">
                <Controller
                  name="installments"
                  control={control}
                  render={({ field }) => (
                    <Input label="Total de parcelas" type="number" min="2" max="60" {...field} onChange={(e) => field.onChange(Number(e.target.value))} className="flex-1" />
                  )}
                />
                <Controller
                  name="installmentCurrent"
                  control={control}
                  render={({ field }) => (
                    <Input label="Parcela atual" type="number" min="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} className="flex-1" />
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note */}
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Input label="Nota (opcional)" variant="textarea" placeholder="Alguma observação..." {...field} />
          )}
        />
      </form>
    </Modal>
  );
}
