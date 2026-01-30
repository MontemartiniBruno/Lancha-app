'use client';

import { Card } from '@/components/ui/Card';
import { useBalance } from '@/hooks/useBalance';

export function UserBalanceCard() {
  const { userBalances, loading } = useBalance();
  
  if (loading) {
    return (
      <Card title="📊 Balance por Usuario">
        <div className="text-center text-gray-500 py-4">Cargando...</div>
      </Card>
    );
  }
  
  return (
    <Card title="📊 Balance por Usuario">
      <div className="space-y-3">
        {userBalances?.map((user) => {
          // IMPORTANTE: La vista devuelve valores positivos para deudas
          // Necesitamos invertir el signo para mostrar correctamente
          const balance = -user.balance; // Invertir signo
          
          const isNegative = balance < 0;
          const isPositive = balance > 0;
          
          return (
            <div key={user.id} className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{user.name}</span>
                <span className={`font-semibold text-lg ${
                  isNegative ? 'text-red-600' : 
                  isPositive ? 'text-green-600' : 
                  'text-gray-600'
                }`}>
                  {balance < 0 && '-'}
                  {balance > 0 && '+'}
                  ${Math.abs(balance).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          );
        })}
        
        {(!userBalances || userBalances.length === 0) && (
          <div className="text-sm text-gray-500 text-center py-8">
            Sin aportes registrados todavía
          </div>
        )}
      </div>
    </Card>
  );
}
