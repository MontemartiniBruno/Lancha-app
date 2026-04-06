'use client';

import { useState } from 'react';
import { differenceInMonths, parseISO } from 'date-fns';
import { Pencil, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getMonthlyEquiv } from '@/hooks/useRecurringExpenses';
import type { RecurringExpense } from '@/types';

interface RecurringExpenseItemProps {
  item: RecurringExpense;
  onEdit: (item: RecurringExpense) => void;
  onMarkDone: (item: RecurringExpense) => void;
  onDelete: (id: string) => void;
}

function frequencyLabel(item: RecurringExpense): string {
  if (item.frequency_type === 'monthly') return 'Mensual';
  if (item.frequency_type === 'annual') return 'Anual';
  if (item.frequency_months) return `Cada ${item.frequency_months} meses`;
  return 'Periódico';
}

function getDueDateColor(nextDueDate: string): string {
  const today = new Date();
  const due = parseISO(nextDueDate);
  const daysUntil = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 0) return 'text-red-600 font-semibold';
  if (daysUntil <= 30) return 'text-orange-500 font-semibold';
  return 'text-gray-500';
}

function FundingProgress({ item }: { item: RecurringExpense }) {
  if (!item.last_done_date || !item.frequency_months || item.amount <= 0) return null;

  const monthsElapsed = differenceInMonths(new Date(), parseISO(item.last_done_date));
  const fundedPct = Math.min((monthsElapsed / item.frequency_months) * 100, 100);
  const accumulated = Math.min((item.amount / item.frequency_months) * monthsElapsed, item.amount);

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Fondos acumulados: {formatCurrency(accumulated)}</span>
        <span>{Math.round(fundedPct)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-primary-500 h-1.5 rounded-full transition-all"
          style={{ width: `${fundedPct}%` }}
        />
      </div>
    </div>
  );
}

export function RecurringExpenseItem({ item, onEdit, onMarkDone, onDelete }: RecurringExpenseItemProps) {
  const monthly = getMonthlyEquiv(item);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{item.name}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {frequencyLabel(item)}
            </span>
          </div>

          <div className="mt-0.5">
            {item.amount > 0 ? (
              <span className="text-sm text-gray-600">
                {formatCurrency(item.amount)}
                {item.frequency_type !== 'monthly' && (
                  <span className="text-gray-400 text-xs ml-1">
                    ({formatCurrency(monthly)}/mes)
                  </span>
                )}
              </span>
            ) : (
              <span className="text-sm text-gray-400 italic">Monto pendiente</span>
            )}
          </div>

          {item.next_due_date && (
            <div className={`text-xs mt-0.5 ${getDueDateColor(item.next_due_date)}`}>
              Vence: {formatDate(item.next_due_date)}
            </div>
          )}

          {item.last_done_date && (
            <div className="text-xs text-gray-400 mt-0.5">
              Último: {formatDate(item.last_done_date)}
            </div>
          )}

          <FundingProgress item={item} />

          {item.notes && (
            <div className="text-xs text-gray-400 mt-1">{item.notes}</div>
          )}
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => onEdit(item)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          {item.frequency_type !== 'monthly' && (
            <Button variant="secondary" size="sm" onClick={() => onMarkDone(item)}>
              <CheckCircle className="w-3.5 h-3.5" />
            </Button>
          )}
          {confirmDelete ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(item.id)}
              title="Confirmar eliminación"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-400" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
