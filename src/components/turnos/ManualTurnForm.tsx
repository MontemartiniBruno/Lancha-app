'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useTurns } from '@/hooks/useTurns';
import { useToastContext } from '@/components/providers/ToastProvider';
import { esFinDeSemanaOFeriado } from '@/lib/holidays';

interface ManualTurnFormProps {
  onTurnAdded?: () => void;
}

export function ManualTurnForm({ onTurnAdded }: ManualTurnFormProps) {
  const { addManualTurn, users, refresh } = useTurns();
  const { success, error } = useToastContext();
  const [date, setDate] = useState('');
  const [type, setType] = useState<'private' | 'shared'>('private');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      error('Por favor selecciona una fecha');
      return;
    }

    // Permitir agregar turnos en cualquier día
    // const selectedDate = new Date(date);
    // if (!esFinDeSemanaOFeriado(selectedDate)) {
    //   error('Solo se pueden agregar turnos en fines de semana o feriados');
    //   return;
    // }

    if (type === 'private' && !assignedTo) {
      error('Por favor selecciona un usuario para turnos privados');
      return;
    }

    setLoading(true);

    try {
      const result = await addManualTurn({
        turn_date: date,
        type,
        assigned_to: type === 'private' ? assignedTo : null,
        notes: notes || undefined,
      });

      if (result?.error) {
        // Verificar si es un error de duplicado
        if (result.error.code === '23505' || result.error.message?.includes('duplicate')) {
          error('Ya existe un turno en esta fecha. Se actualizará el turno existente.');
        } else {
          error('Error al agregar el turno: ' + (result.error.message || 'Error desconocido'));
        }
        setLoading(false);
        return;
      }

      // Forzar refresh después de agregar
      await refresh();
      
      // Notificar al componente padre para que refresque
      if (onTurnAdded) {
        onTurnAdded();
      }
      
      setLoading(false);
      setDate('');
      setType('private');
      setAssignedTo('');
      setNotes('');
      success('Turno agregado exitosamente');
    } catch (err) {
      setLoading(false);
      error('Error al agregar el turno');
    }
  };

  return (
    <Card title="Agregar Turno Manual">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          label="Tipo de Turno"
          value={type}
          onChange={(e) => setType(e.target.value as 'private' | 'shared')}
        >
          <option value="private">Privado</option>
          <option value="shared">Compartido</option>
        </Select>

        {type === 'private' && (
          <Select
            label="Asignado a"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          >
            <option value="">Seleccionar usuario</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        )}

        <Input
          label="Notas (opcional)"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Turno'}
        </Button>
      </form>
    </Card>
  );
}
