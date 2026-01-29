'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Movement, Transfer, Expense } from '@/types';

export function useMovements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMovements();
  }, []);
  
  async function fetchMovements() {
    try {
      setLoading(true);
      
      // Obtener transferencias
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select(`
          *,
          users:user_id (name)
        `)
        .order('transfer_date', { ascending: false });
      
      // Obtener gastos
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      
      if (transfersError || expensesError) {
        console.error('Error fetching movements:', transfersError || expensesError);
        return;
      }
      
      // Combinar y formatear movimientos
      const allMovements: Movement[] = [];
      
      transfers?.forEach((transfer: any) => {
        allMovements.push({
          id: transfer.id,
          type: 'transfer',
          date: transfer.transfer_date,
          description: `Transferencia de ${transfer.users?.name || 'Usuario'}`,
          amount: transfer.amount,
          created_at: transfer.created_at,
        });
      });
      
      expenses?.forEach((expense: Expense) => {
        allMovements.push({
          id: expense.id,
          type: 'expense',
          date: expense.expense_date,
          description: expense.concept,
          amount: -expense.amount,
          created_at: expense.created_at,
        });
      });
      
      // Ordenar por fecha (más recientes primero)
      allMovements.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setMovements(allMovements);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function addTransfer(transfer: Omit<Transfer, 'id' | 'created_at'>) {
    try {
      const { error } = await supabase
        .from('transfers')
        .insert(transfer);
      
      if (error) {
        console.error('Error adding transfer:', error);
        return { error };
      }
      
      await fetchMovements();
      return { error: null };
    } catch (error) {
      console.error('Error adding transfer:', error);
      return { error };
    }
  }
  
  async function addExpense(expense: Omit<Expense, 'id' | 'created_at'>) {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert(expense);
      
      if (error) {
        console.error('Error adding expense:', error);
        return { error };
      }
      
      await fetchMovements();
      return { error: null };
    } catch (error) {
      console.error('Error adding expense:', error);
      return { error };
    }
  }
  
  async function deleteTransfer(id: string) {
    try {
      const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting transfer:', error);
        return;
      }
      
      await fetchMovements();
    } catch (error) {
      console.error('Error deleting transfer:', error);
    }
  }
  
  async function deleteExpense(id: string) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting expense:', error);
        return;
      }
      
      await fetchMovements();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }
  
  return {
    movements,
    loading,
    addTransfer,
    addExpense,
    deleteTransfer,
    deleteExpense,
    refresh: fetchMovements,
  };
}
