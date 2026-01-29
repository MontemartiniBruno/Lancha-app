'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useMovements } from '@/hooks/useMovements';
import { useBalance } from '@/hooks/useBalance';
import { useToastContext } from '@/components/providers/ToastProvider';
import { supabase } from '@/lib/supabase';
import { formatCurrencyInput, parseCurrency } from '@/lib/utils';

export function TransferForm() {
  const { addTransfer, refresh } = useMovements();
  const { refresh: refreshBalance } = useBalance();
  const { success, error } = useToastContext();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  // Cargar usuarios
  useEffect(() => {
    supabase
      .from('users')
      .select('id, name')
      .then(({ data }) => {
        if (data) setUsers(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !amount || amount === '$' || !transferDate) {
      error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    // Parsear el monto formateado a número
    const parsedAmount = parseCurrency(amount);
    
    if (parsedAmount <= 0) {
      error('El monto debe ser mayor a 0');
      setLoading(false);
      return;
    }
    
    const result = await addTransfer({
      user_id: userId,
      amount: parsedAmount,
      transfer_date: transferDate,
      notes: notes || undefined,
    });

    setLoading(false);

    if (!result.error) {
      setUserId('');
      setAmount('');
      setTransferDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      await refreshBalance();
      success('Transferencia registrada exitosamente');
    } else {
      error('Error al registrar la transferencia');
    }
  };

  return (
    <Card title="Registrar Transferencia">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <Select
          label="Usuario"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        >
          <option value="">Seleccionar usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>

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
          value={transferDate}
          onChange={(e) => setTransferDate(e.target.value)}
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
          {loading ? 'Registrando...' : 'Registrar Transferencia'}
        </Button>
      </form>
    </Card>
  );
}
