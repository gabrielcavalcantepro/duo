import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PARTNER_COLORS } from '../../utils/categories';

const schema = z.object({
  name: z.string().min(1, 'Informe o nome do casal'),
  partner1Name: z.string().min(1, 'Informe o nome'),
  partner1Color: z.string().min(1),
  partner2Name: z.string().min(1, 'Informe o nome'),
  partner2Color: z.string().min(1),
  closingDay: z.number().min(1).max(28),
});

export default function CoupleSetup({ onNext }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      partner1Name: '',
      partner1Color: '#D4537E',
      partner2Name: '',
      partner2Color: '#1D9E75',
      closingDay: 5,
    },
  });

  const p1Color = watch('partner1Color');
  const p2Color = watch('partner2Color');

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="flex-1 flex flex-col min-h-dvh"
    >
      {/* Header */}
      <div className="bg-[var(--rose-light)] px-6 pt-16 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--rose)] flex items-center justify-center text-white text-lg">2</div>
          <div className="h-1 flex-1 rounded-full bg-[var(--rose)]/30">
            <div className="h-1 bg-[var(--rose)] rounded-full w-2/3" />
          </div>
        </div>
        <h1 className="font-serif text-3xl text-[var(--ink)] mb-2">Contem-nos sobre vocês</h1>
        <p className="font-sans text-sm text-[var(--muted)]">Essas informações personalizam a experiência do Duo</p>
      </div>

      <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
        {/* Couple name */}
        <Input
          label="Nome do casal"
          placeholder="Ex: Ana & Rafael"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Partner 1 */}
        <div className="p-4 rounded-card border border-[var(--border)] bg-white space-y-4">
          <h3 className="font-serif text-lg text-[var(--ink)]">Pessoa 1</h3>
          <Input
            label="Nome"
            placeholder="Ex: Ana"
            error={errors.partner1Name?.message}
            {...register('partner1Name')}
          />
          <div>
            <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Cor</p>
            <div className="flex gap-2.5">
              {PARTNER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    if (c.value !== p2Color) setValue('partner1Color', c.value);
                  }}
                  className={`w-9 h-9 rounded-full transition-all ${p1Color === c.value ? 'ring-2 ring-offset-2 scale-110' : 'opacity-70'} ${c.value === p2Color ? 'cursor-not-allowed opacity-30' : ''}`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Partner 2 */}
        <div className="p-4 rounded-card border border-[var(--border)] bg-white space-y-4">
          <h3 className="font-serif text-lg text-[var(--ink)]">Pessoa 2</h3>
          <Input
            label="Nome"
            placeholder="Ex: Rafael"
            error={errors.partner2Name?.message}
            {...register('partner2Name')}
          />
          <div>
            <p className="font-sans text-sm font-medium text-[var(--ink-soft)] mb-2">Cor</p>
            <div className="flex gap-2.5">
              {PARTNER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    if (c.value !== p1Color) setValue('partner2Color', c.value);
                  }}
                  className={`w-9 h-9 rounded-full transition-all ${p2Color === c.value ? 'ring-2 ring-offset-2 scale-110' : 'opacity-70'} ${c.value === p1Color ? 'cursor-not-allowed opacity-30' : ''}`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Closing day */}
        <div>
          <label className="font-sans text-sm font-medium text-[var(--ink-soft)] block mb-1">
            Dia de fechamento do mês financeiro
          </label>
          <select
            {...register('closingDay', { valueAsNumber: true })}
            className="w-full rounded-element border border-[var(--border)] bg-white px-4 py-3 font-sans text-base text-[var(--ink)] focus:border-[var(--rose)] focus:ring-2 focus:ring-[var(--rose)]/20 outline-none"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Dia {d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-6 py-6 border-t border-[var(--border)] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <Button onClick={handleSubmit(onNext)} loading={isSubmitting} fullWidth size="lg">
          Próximo passo →
        </Button>
      </div>
    </motion.div>
  );
}
