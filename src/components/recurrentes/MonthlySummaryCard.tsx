'use client';

import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { getMonthlyEquiv, useRecurringExpenses } from '@/hooks/useRecurringExpenses';

export function MonthlySummaryCard() {
  const { items, summary, loading } = useRecurringExpenses();

  if (loading) {
    return (
      <Card title="💰 Cuota mensual estimada">
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }

  if (!summary) return null;

  const { perMemberMonthly, totalMonthlyAmount, emergencySavingsPerMember, guarderia } = summary;

  return (
    <Card title="💰 Cuota mensual estimada">
      {/* Monto principal */}
      <div className="text-center py-4 border-b border-gray-100 mb-4">
        <div className="text-sm text-gray-500 mb-1">Por socio por mes</div>
        <div className="text-4xl font-bold text-primary-600">
          {formatCurrency(perMemberMonthly)}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Total del fondo: {formatCurrency(totalMonthlyAmount)}/mes
        </div>
      </div>

      {/* Desglose */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Desglose
        </div>
        {items.map((item) => {
          const monthly = getMonthlyEquiv(item);
          return (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">
                {item.name}
                {item.frequency_type !== 'monthly' && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({item.frequency_type === 'annual' ? 'anual' : `c/${item.frequency_months}m`} prorrateado)
                  </span>
                )}
              </span>
              {item.amount > 0 ? (
                <span className="font-medium text-gray-800">{formatCurrency(monthly)}/mes</span>
              ) : (
                <span className="text-xs text-gray-400 italic">Monto pendiente</span>
              )}
            </div>
          );
        })}

        {/* Ahorro emergencia - separado como pidió el usuario */}
        {guarderia && guarderia.amount > 0 && (
          <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-200 pt-2 mt-2">
            <span className="text-gray-700">
              Ahorro emergencia
              <span className="text-xs text-gray-400 ml-1">(5% guardería c/socio)</span>
            </span>
            <span className="font-medium text-gray-800">
              {formatCurrency(emergencySavingsPerMember)}/mes
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
