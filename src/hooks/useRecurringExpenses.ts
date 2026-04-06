'use client';

import { useEffect, useState } from 'react';
import { addMonths, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { RecurringExpense, RecurringExpenseFrequency, RecurringExpenseSummary } from '@/types';

export type RecurringExpenseCreate = {
  name: string;
  amount: number;
  frequency_type: RecurringExpenseFrequency;
  frequency_months: number | null;
  last_done_date: string | null;
  notes: string | null;
};

export function getMonthlyEquiv(item: RecurringExpense): number {
  if (item.amount <= 0) return 0;
  if (item.frequency_type === 'monthly') return item.amount;
  if (item.frequency_type === 'annual') return item.amount / 12;
  if (item.frequency_type === 'custom' && item.frequency_months) {
    return item.amount / item.frequency_months;
  }
  return 0;
}

function computeSummary(items: RecurringExpense[]): RecurringExpenseSummary {
  const guarderia = items.find(item =>
    item.name.toLowerCase().includes('guarder')
  ) ?? null;

  const subtotalFromItems = items.reduce((sum, item) => sum + getMonthlyEquiv(item), 0);
  const emergencySavingsPerMember = (guarderia?.amount ?? 0) * 0.05;
  const totalMonthlyAmount = subtotalFromItems + emergencySavingsPerMember * 3;
  const perMemberMonthly = totalMonthlyAmount / 3;

  return {
    items,
    totalMonthlyAmount,
    perMemberMonthly,
    emergencySavingsPerMember,
    guarderia,
  };
}

export function useRecurringExpenses() {
  const [items, setItems] = useState<RecurringExpense[]>([]);
  const [summary, setSummary] = useState<RecurringExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  async function fetchRecurringExpenses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (error) {
        console.error('Error fetching recurring expenses:', error);
        return;
      }

      const fetched = data ?? [];
      setItems(fetched);
      setSummary(computeSummary(fetched));
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRecurringExpense(id: string, updates: Partial<RecurringExpense>) {
    const { error } = await supabase
      .from('recurring_expenses')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating recurring expense:', error);
      throw error;
    }

    await fetchRecurringExpenses();
  }

  async function markAsDone(id: string, doneDate: string) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updates: Partial<RecurringExpense> = {
      last_done_date: doneDate,
    };

    if (item.frequency_months) {
      const nextDue = addMonths(parseISO(doneDate), item.frequency_months);
      updates.next_due_date = nextDue.toISOString().split('T')[0];
    }

    await updateRecurringExpense(id, updates);
  }

  async function createRecurringExpense(data: RecurringExpenseCreate) {
    const maxOrder = items.reduce((max, i) => Math.max(max, i.sort_order), 0);
    const { error } = await supabase
      .from('recurring_expenses')
      .insert({ ...data, active: true, sort_order: maxOrder + 1 });

    if (error) {
      console.error('Error creating recurring expense:', error);
      throw error;
    }

    await fetchRecurringExpenses();
  }

  async function deleteRecurringExpense(id: string) {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recurring expense:', error);
      throw error;
    }

    await fetchRecurringExpenses();
  }

  return {
    items,
    summary,
    loading,
    updateRecurringExpense,
    createRecurringExpense,
    deleteRecurringExpense,
    markAsDone,
    refresh: fetchRecurringExpenses,
  };
}
