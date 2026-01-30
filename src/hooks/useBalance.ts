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
    setLoading(true);
    
    try {
      // Balance cuenta común - usar vista si existe, sino calcular
      const { data: balanceData } = await supabase
        .from('common_balance')
        .select('balance')
        .single();
      
      if (balanceData) {
        setCommonBalance(balanceData.balance);
      } else {
        // Fallback: calcular manualmente si la vista no existe
        const { data: transfers } = await supabase
          .from('transfers')
          .select('*');
        
        const { data: expenses } = await supabase
          .from('expenses')
          .select('*');
        
        const totalTransfersAmount = transfers?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
        const balance = totalTransfersAmount - totalExpenses;
        setCommonBalance(balance);
      }
      
      // Balance por usuario - USAR DIRECTAMENTE LO QUE DEVUELVE LA VISTA
      const { data: usersData } = await supabase
        .from('user_balances')
        .select('*')
        .order('name');
      
      if (usersData) {
        // NO TOCAR LOS VALORES, usarlos tal cual vienen de la vista
        setUserBalances(usersData);
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
