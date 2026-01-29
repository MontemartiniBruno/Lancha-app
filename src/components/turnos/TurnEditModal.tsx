'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTurns } from '@/hooks/useTurns';
import { useToastContext } from '@/components/providers/ToastProvider';
import type { Turn } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface TurnEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  turn: Turn | null;
  date: Date | null;
}

export function TurnEditModal({ isOpen, onClose, turn, date }: TurnEditModalProps) {
  const { updateTurn, deleteTurn, users, addManualTurn, refresh } = useTurns();
  const { success, error } = useToastContext();
  const [type, setType] = useState<'private' | 'shared'>('private');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (turn) {
      setType(turn.type);
      setAssignedTo(turn.assigned_to || '');
      setNotes(turn.notes || '');
    } else if (date) {
      setType('private');
      setAssignedTo('');
      setNotes('');
    }
  }, [turn, date]);

  const handleSave = async () => {
    if (!turn && !date) return;

    if (type === 'private' && !assignedTo) {
      error('Por favor selecciona un usuario para turnos privados');
      return;
    }

    setLoading(true);

    try {
      if (turn) {
        // Actualizar turno existente
        await updateTurn(turn.id, {
          type,
          assigned_to: type === 'private' ? assignedTo : null,
          notes: notes || undefined,
        });
        await refresh();
        success('Turno actualizado exitosamente');
      } else if (date) {
        // Crear nuevo turno
        const result = await addManualTurn({
          turn_date: date.toISOString().split('T')[0],
          type,
          assigned_to: type === 'private' ? assignedTo : null,
          notes: notes || undefined,
        });
        
        if (result?.error) {
          error('Error al agregar el turno: ' + (result.error.message || 'Error desconocido'));
          setLoading(false);
          return;
        }
        
        await refresh();
        success('Turno agregado exitosamente');
      }

      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      error('Error al guardar el turno');
    }
  };

  const handleDelete = async () => {
    if (!turn) return;

    if (showDeleteConfirm) {
      setLoading(true);
      try {
        await deleteTurn(turn.id);
        await refresh();
        setLoading(false);
        onClose();
        success('Turno eliminado exitosamente');
      } catch (err) {
        setLoading(false);
        error('Error al eliminar el turno');
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const displayDate = turn
    ? format(new Date(turn.turn_date), "EEEE dd/MM/yyyy", { locale: es })
    : date
    ? format(date, "EEEE dd/MM/yyyy", { locale: es })
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={turn ? 'Editar Turno' : 'Agregar Turno'}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <strong>Fecha:</strong> {displayDate}
        </div>

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

        <div className="space-y-3 pt-2">
          {showDeleteConfirm && turn && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">
                ¿Estás seguro de eliminar este turno?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  size="sm"
                  disabled={loading}
                >
                  Sí, eliminar
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              fullWidth
              disabled={loading || (type === 'private' && !assignedTo)}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
            {turn && !showDeleteConfirm && (
              <Button
                onClick={handleDelete}
                variant="danger"
                disabled={loading}
              >
                Eliminar
              </Button>
            )}
            <Button
              onClick={() => {
                setShowDeleteConfirm(false);
                onClose();
              }}
              variant="secondary"
              fullWidth
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
