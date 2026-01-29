'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTurns } from '@/hooks/useTurns';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';

export function UpcomingTurns() {
  const { upcomingTurns, users, loading } = useTurns();
  
  if (loading) {
    return (
      <Card title="📅 Próximos Turnos">
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }
  
  return (
    <Link href="/turnos">
      <Card title="📅 Próximos Turnos" className="cursor-pointer hover:shadow-md transition-shadow">
        <div className="space-y-3">
          {upcomingTurns && upcomingTurns.length > 0 ? (
            upcomingTurns.slice(0, 4).map((turn) => {
              const user = users?.find(u => u.id === turn.assigned_to);
              const date = parseISO(turn.turn_date);
              
              return (
                <div key={turn.id} className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-medium text-gray-800 capitalize">
                      {format(date, "EEEE dd/MM", { locale: es })}
                    </div>
                  </div>
                  <Badge variant={turn.type === 'private' ? 'private' : 'shared'}>
                    {turn.type === 'private' ? `🔒 ${user?.name || 'Sin asignar'}` : '👥 Compartido'}
                  </Badge>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">No hay turnos próximos</div>
          )}
        </div>
      </Card>
    </Link>
  );
}
