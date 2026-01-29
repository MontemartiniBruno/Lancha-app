'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserBalance, CommonAccount } from '@/types';

export function useBalance() {
  const [commonBalance, setCommonBalance] = useState<number | null>(null);
  const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
  const [accountInfo, setAccountInfo] = useState<CommonAccount | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBalance();
    fetchAccountInfo();
  }, []);
  
  async function fetchBalance() {
    try {
      setLoading(true);
      
      // Obtener todas las transferencias
      const { data: transfers } = await supabase
        .from('transfers')
        .select('*');
      
      // Obtener todos los gastos
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*');
      
      // Calcular balance común
      const totalTransfers = transfers?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const balance = totalTransfers - totalExpenses;
      setCommonBalance(balance);
      
      // Obtener usuarios
      const { data: users } = await supabase
        .from('users')
        .select('*');
      
      if (users) {
        // Calcular balance por usuario
        // Gastos totales / 3 = lo que cada usuario debe pagar
        const gastosPorUsuario = totalExpenses / 3;
        
        const balances: UserBalance[] = users.map(user => {
          const userTransfers = transfers?.filter(t => t.user_id === user.id) || [];
          const totalTransferred = userTransfers.reduce((sum, t) => sum + t.amount, 0);
          
          // Balance = Transferencias del usuario - (Gastos totales / 3)
          // Negativo = debe, Positivo = adelantó
          const balancePerUser = totalTransferred - gastosPorUsuario;
          
          return {
            id: user.id,
            name: user.name,
            total_transferred: totalTransferred,
            balance: balancePerUser,
          };
        });
        
        setUserBalances(balances);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchAccountInfo() {
    try {
      const { data, error } = await supabase
        .from('common_account')
        .select('*')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching account info:', error);
        return;
      }
      
      if (data) {
        setAccountInfo(data);
      } else {
        // Crear cuenta común si no existe
        const { data: newAccount } = await supabase
          .from('common_account')
          .insert({
            holder_name: '',
            cvu_alias: '',
          })
          .select()
          .single();
        
        if (newAccount) {
          setAccountInfo(newAccount);
        }
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  }
  
  async function updateAccount(updates: Partial<CommonAccount>) {
    if (!accountInfo) return;
    
    const { error } = await supabase
      .from('common_account')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountInfo.id);
    
    if (!error) {
      await fetchAccountInfo();
    } else {
      console.error('Error updating account:', error);
    }
  }
  
  return { 
    commonBalance, 
    userBalances, 
    accountInfo,
    loading,
    updateAccount,
    refresh: fetchBalance 
  };
}
