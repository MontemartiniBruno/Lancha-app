'use client';

import { Card } from '@/components/ui/Card';
import { useBalance } from '@/hooks/useBalance';

export function UserBalanceCard() {
  const { userBalances, loading } = useBalance();
  
  if (loading) {
    return (
      <Card title="📊 Balance por Usuario">
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }
  
  return (
    <Card title="📊 Balance por Usuario">
      <div className="space-y-3">
        {userBalances?.map((user) => (
          <div key={user.id} className="flex justify-between items-center py-2">
            <span className="font-medium text-gray-700">{user.name}</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                user.balance < 0 ? 'text-red-600' : 
                user.balance > 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                ${Math.abs(user.balance).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              {user.balance < 0 ? (
                <span className="text-red-600 text-lg">⚠️</span>
              ) : user.balance > 0 ? (
                <span className="text-green-600 text-lg">✅</span>
              ) : (
                <span className="text-gray-400 text-lg">⚪</span>
              )}
            </div>
          </div>
        ))}
        {(!userBalances || userBalances.length === 0) && (
          <div className="text-center py-4 text-gray-500">No hay usuarios</div>
        )}
      </div>
    </Card>
  );
}
