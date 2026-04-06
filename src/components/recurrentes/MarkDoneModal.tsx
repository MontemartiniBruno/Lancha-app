'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToastContext } from '@/components/providers/ToastProvider';
import type { RecurringExpense } from '@/types';

interface MarkDoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RecurringExpense | null;
  onConfirm: (id: string, doneDate: string) => Promise<void>;
}

export function MarkDoneModal({ isOpen, onClose, item, onConfirm }: MarkDoneModalProps) {
  const { success, error } = useToastContext();
  const [doneDate, setDoneDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(item.id, doneDate);
      success(`${item.name} marcado como realizado`);
      onClose();
    } catch {
      error('Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Marcar como hecho: ${item.name}`}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Esto actualizará la fecha del último mantenimiento y calculará el próximo vencimiento.
        </p>
        <Input
          label="Fecha de realización"
          type="date"
          value={doneDate}
          onChange={(e) => setDoneDate(e.target.value)}
        />
        <div className="flex gap-2 pt-2">
          <Button onClick={handleConfirm} fullWidth disabled={loading}>
            {loading ? 'Guardando...' : 'Confirmar'}
          </Button>
          <Button onClick={onClose} variant="secondary" fullWidth disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
