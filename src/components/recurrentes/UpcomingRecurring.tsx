'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses';
import { formatDate } from '@/lib/utils';
import { parseISO, differenceInDays, setDate } from 'date-fns';

const MONTHLY_DUE_DAY = 10;

export function UpcomingRecurring() {
  const { items, loading } = useRecurringExpenses();

  if (loading) {
    return (
      <Card title="🔄 Próximos vencimientos">
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }

  const today = new Date();
  const dayOfMonth = today.getDate();

  // For monthly items: show as due on the 10th of this month, only during days 1–10
  const monthlyDueThisMonth = dayOfMonth <= MONTHLY_DUE_DAY
    ? setDate(today, MONTHLY_DUE_DAY)
    : null;

  const upcoming = items
    .map(item => {
      if (item.frequency_type === 'monthly' && monthlyDueThisMonth) {
        return { ...item, virtualDueDate: monthlyDueThisMonth.toISOString().split('T')[0] };
      }
      if (item.next_due_date) {
        return { ...item, virtualDueDate: item.next_due_date };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .map(item => ({
      ...item,
      daysUntil: differenceInDays(parseISO(item.virtualDueDate), today),
    }))
    .filter(item => item.daysUntil <= 60)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  return (
    <Link href="/recurrentes">
      <Card title="🔄 Próximos vencimientos" className="cursor-pointer hover:shadow-md transition-shadow">
        <div className="space-y-3">
          {upcoming.length > 0 ? (
            upcoming.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-1">
                <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                <span className={`text-xs font-medium ${
                  item.daysUntil <= 0
                    ? 'text-red-600'
                    : item.daysUntil <= 30
                    ? 'text-orange-500'
                    : 'text-gray-500'
                }`}>
                  {item.daysUntil <= 0
                    ? 'Vencido'
                    : item.daysUntil === 0
                    ? 'Hoy'
                    : formatDate(item.virtualDueDate)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Sin vencimientos próximos
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
