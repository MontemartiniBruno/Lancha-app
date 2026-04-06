'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToastContext } from '@/components/providers/ToastProvider';
import { formatCurrencyInput, parseCurrency } from '@/lib/utils';
import type { RecurringExpense, RecurringExpenseFrequency } from '@/types';
import type { RecurringExpenseCreate } from '@/hooks/useRecurringExpenses';

interface RecurringExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  item?: RecurringExpense | null;
  onSave: (id: string, updates: Partial<RecurringExpense>) => Promise<void>;
  onCreate: (data: RecurringExpenseCreate) => Promise<void>;
}

export function RecurringExpenseForm({ isOpen, onClose, item, onSave, onCreate }: RecurringExpenseFormProps) {
  const { success, error } = useToastContext();
  const [name, setName] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('$');
  const [frequencyType, setFrequencyType] = useState<RecurringExpenseFrequency>('monthly');
  const [frequencyMonths, setFrequencyMonths] = useState('');
  const [lastDoneDate, setLastDoneDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setName(item.name);
        setAmountDisplay(item.amount > 0 ? formatCurrencyInput(String(item.amount)) : '$');
        setFrequencyType(item.frequency_type);
        setFrequencyMonths(item.frequency_months ? String(item.frequency_months) : '');
        setLastDoneDate(item.last_done_date ?? '');
        setNotes(item.notes ?? '');
      } else {
        setName('');
        setAmountDisplay('$');
        setFrequencyType('monthly');
        setFrequencyMonths('');
        setLastDoneDate('');
        setNotes('');
      }
    }
  }, [isOpen, item]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountDisplay(formatCurrencyInput(e.target.value));
  };

  const handleSave = async () => {
    const amount = parseCurrency(amountDisplay);
    const freqMonths = frequencyType !== 'monthly' && frequencyMonths
      ? parseInt(frequencyMonths, 10)
      : null;

    setLoading(true);
    try {
      if (item) {
        await onSave(item.id, {
          name: name.trim(),
          amount,
          frequency_type: frequencyType,
          frequency_months: freqMonths,
          last_done_date: lastDoneDate || null,
          notes: notes.trim() || null,
        });
        success('Gasto recurrente actualizado');
      } else {
        await onCreate({
          name: name.trim(),
          amount,
          frequency_type: frequencyType,
          frequency_months: freqMonths,
          last_done_date: lastDoneDate || null,
          notes: notes.trim() || null,
        });
        success('Gasto recurrente agregado');
      }
      onClose();
    } catch {
      error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? `Editar: ${item.name}` : 'Nuevo gasto recurrente'}>
      <div className="space-y-4">
        <Input
          label="Nombre"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Guardería"
        />

        <Input
          label="Monto"
          type="text"
          value={amountDisplay}
          onChange={handleAmountChange}
          placeholder="$0"
        />

        <Select
          label="Frecuencia"
          value={frequencyType}
          onChange={(e) => setFrequencyType(e.target.value as RecurringExpenseFrequency)}
        >
          <option value="monthly">Mensual</option>
          <option value="annual">Anual</option>
          <option value="custom">Personalizado</option>
        </Select>

        {frequencyType !== 'monthly' && (
          <Input
            label="Cada cuántos meses"
            type="number"
            min="1"
            value={frequencyMonths}
            onChange={(e) => setFrequencyMonths(e.target.value)}
            placeholder="Ej: 12"
          />
        )}

        <Input
          label="Última vez realizado"
          type="date"
          value={lastDoneDate}
          onChange={(e) => setLastDoneDate(e.target.value)}
        />

        <Input
          label="Notas (opcional)"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales"
        />

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} fullWidth disabled={loading || !name.trim()}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button onClick={onClose} variant="secondary" fullWidth disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
