'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useTurns } from '@/hooks/useTurns';
import { useToastContext } from '@/components/providers/ToastProvider';
import { Shuffle } from 'lucide-react';

interface SorteoButtonProps {
  month: Date;
}

export function SorteoButton({ month }: SorteoButtonProps) {
  const { sortear, users, refresh } = useTurns();
  const { success, error } = useToastContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSortear = async () => {
    if (users.length === 0) {
      error('No hay usuarios disponibles');
      return;
    }

    setLoading(true);
    try {
      await sortear(month.getFullYear(), month.getMonth());
      // Forzar refresh después del sorteo
      await refresh();
      setLoading(false);
      setShowConfirm(false);
      success('Turnos sorteados exitosamente');
    } catch (err) {
      setLoading(false);
      error('Error al sortear los turnos');
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2"
      >
        <Shuffle className="w-4 h-4" />
        Sortear Mes
      </Button>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmar Sorteo"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de sortear los turnos para{' '}
            <strong>
              {month.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </strong>
            ?
          </p>
          <p className="text-sm text-gray-500">
            Esto eliminará los turnos existentes del mes y creará nuevos turnos
            (60% privados, 40% compartidos).
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSortear}
              fullWidth
              disabled={loading}
            >
              {loading ? 'Sorteando...' : 'Confirmar'}
            </Button>
            <Button
              onClick={() => setShowConfirm(false)}
              variant="secondary"
              fullWidth
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
