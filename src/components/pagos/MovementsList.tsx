'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { MovementItem } from './MovementItem';
import { Button } from '@/components/ui/Button';
import { useMovements } from '@/hooks/useMovements';
import { useToastContext } from '@/components/providers/ToastProvider';

export function MovementsList() {
  const { movements, loading, deleteTransfer, deleteExpense, refresh } = useMovements();
  const { success, error } = useToastContext();
  const [filterType, setFilterType] = useState<'all' | 'transfer' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredMovements = useMemo(() => {
    if (!movements) return [];
    
    let filtered = movements;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [movements, filterType, searchTerm]);

  const handleDelete = async (movement: { id: string; type: 'transfer' | 'expense' }) => {
    if (deleteConfirm === movement.id) {
      try {
        if (movement.type === 'transfer') {
          await deleteTransfer(movement.id);
        } else {
          await deleteExpense(movement.id);
        }
        await refresh();
        setDeleteConfirm(null);
        success('Movimiento eliminado exitosamente');
      } catch (err) {
        error('Error al eliminar el movimiento');
      }
    } else {
      setDeleteConfirm(movement.id);
    }
  };

  if (loading) {
    return (
      <Card title="Historial de Movimientos">
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }

  return (
    <Card title="Historial de Movimientos">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'transfer' | 'expense')}
            className="flex-1"
          >
            <option value="all">Todos</option>
            <option value="transfer">Transferencias</option>
            <option value="expense">Gastos</option>
          </Select>
          
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="flex-1"
          />
        </div>

        <div className="space-y-2">
          {filteredMovements.length > 0 ? (
            filteredMovements.map((movement) => (
              <MovementItem
                key={movement.id}
                movement={movement}
                movementType={movement.type}
                movementId={movement.id}
                showConfirm={deleteConfirm === movement.id}
                onDelete={() => handleDelete({ id: movement.id, type: movement.type })}
                onCancel={() => setDeleteConfirm(null)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se encontraron movimientos
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
