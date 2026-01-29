'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMovements } from '@/hooks/useMovements';
import { useBalance } from '@/hooks/useBalance';
import { useToastContext } from '@/components/providers/ToastProvider';

export function ExpenseForm() {
  const { addExpense } = useMovements();
  const { refresh: refreshBalance } = useBalance();
  const { success, error } = useToastContext();
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!concept || !amount || !expenseDate) {
      error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    const result = await addExpense({
      concept,
      amount: parseFloat(amount),
      expense_date: expenseDate,
      notes: notes || undefined,
    });

    setLoading(false);

    if (!result.error) {
      setConcept('');
      setAmount('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      await refreshBalance();
      success('Gasto registrado exitosamente');
    } else {
      error('Error al registrar el gasto');
    }
  };

  return (
    <Card title="Registrar Gasto">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <Input
          label="Concepto"
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Ej: Combustible, Mantenimiento, etc."
          required
        />

        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <Input
          label="Fecha"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />

        <Input
          label="Notas (opcional)"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Gasto'}
        </Button>
      </form>
    </Card>
  );
}
