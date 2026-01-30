'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMovements } from '@/hooks/useMovements';
import { useBalance } from '@/hooks/useBalance';
import { useToastContext } from '@/components/providers/ToastProvider';
import { formatCurrencyInput, parseCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function ExpenseForm() {
  const { addExpense } = useMovements();
  const { refresh: refreshBalance } = useBalance();
  const { success, error } = useToastContext();
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!concept || !amount || amount === '$' || !expenseDate) {
      error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    try {
      let receiptUrl = null;
      
      // 1. Subir imagen si existe
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);
        
        if (uploadError) {
          error('Error al subir el comprobante: ' + uploadError.message);
          setLoading(false);
          return;
        }
        
        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);
        
        receiptUrl = urlData.publicUrl;
      }
      
      // 2. Parsear el monto formateado a número
      const parsedAmount = parseCurrency(amount);
      
      if (parsedAmount <= 0) {
        error('El monto debe ser mayor a 0');
        setLoading(false);
        return;
      }
      
      // 3. Insertar gasto
      const result = await addExpense({
        concept,
        amount: parsedAmount,
        expense_date: expenseDate,
        notes: notes || undefined,
        receipt_url: receiptUrl || undefined,
      });

      if (!result.error) {
        // Reset form
        setConcept('');
        setAmount('');
        setExpenseDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setReceiptFile(null);
        await refreshBalance();
        success('Gasto registrado exitosamente');
      } else {
        error('Error al registrar el gasto');
      }
    } catch (err: any) {
      error('Error: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
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
          type="text"
          value={amount}
          onChange={(e) => {
            const formatted = formatCurrencyInput(e.target.value);
            setAmount(formatted);
          }}
          onBlur={(e) => {
            // Asegurar que siempre tenga el formato correcto al perder el foco
            if (e.target.value && e.target.value !== '$') {
              const formatted = formatCurrencyInput(e.target.value);
              setAmount(formatted);
            }
          }}
          placeholder="$0"
          required
        />

        <Input
          label="Fecha"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />

        {/* Comprobante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comprobante (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          {receiptFile && (
            <p className="text-sm text-gray-500 mt-1">
              📎 {receiptFile.name}
            </p>
          )}
        </div>

        <Input
          label="Notas (opcional)"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Subiendo...' : 'Guardar Gasto'}
        </Button>
      </form>
    </Card>
  );
}
