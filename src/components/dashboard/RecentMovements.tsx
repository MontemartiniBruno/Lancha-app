'use client';

import { Card } from '@/components/ui/Card';
import { useMovements } from '@/hooks/useMovements';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';

export function RecentMovements() {
  const { movements, loading } = useMovements();
  
  if (loading) {
    return (
      <Card title="💸 Últimos Movimientos">
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }
  
  const recentMovements = movements?.slice(0, 10) || [];
  
  return (
    <Card title="💸 Últimos Movimientos">
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {recentMovements.length > 0 ? (
          recentMovements.map((movement, index) => {
            const date = parseISO(movement.date);
            const isPositive = movement.amount > 0;
            
            return (
              <div key={index} className="flex justify-between items-center py-2 md:py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{movement.description}</div>
                  <div className="text-sm text-gray-500">
                    {format(date, "dd/MM/yyyy", { locale: es })}
                  </div>
                </div>
                <div className={`font-semibold text-sm md:text-base ml-4 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? '+' : ''}${Math.abs(movement.amount).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-500">No hay movimientos</div>
        )}
      </div>
    </Card>
  );
}
