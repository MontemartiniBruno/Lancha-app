'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RecurringExpenseItem } from './RecurringExpenseItem';
import { RecurringExpenseForm } from './RecurringExpenseForm';
import { MarkDoneModal } from './MarkDoneModal';
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses';
import { useToastContext } from '@/components/providers/ToastProvider';
import type { RecurringExpense } from '@/types';

export function RecurringExpenseList() {
  const { items, loading, updateRecurringExpense, createRecurringExpense, deleteRecurringExpense, markAsDone } = useRecurringExpenses();
  const { error } = useToastContext();
  const [editingItem, setEditingItem] = useState<RecurringExpense | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [markingDoneItem, setMarkingDoneItem] = useState<RecurringExpense | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteRecurringExpense(id);
    } catch {
      error('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">📋 Detalle de gastos</h3>
        </div>
        <div className="p-4 text-center py-4 text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">📋 Detalle de gastos</h3>
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            
          </Button>
        </div>
        <div className="p-4">
          {items.length > 0 ? (
            <div>
              {items.map((item) => (
                <RecurringExpenseItem
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onMarkDone={setMarkingDoneItem}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No hay gastos recurrentes configurados</div>
          )}
        </div>
      </div>

      <RecurringExpenseForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        item={null}
        onSave={updateRecurringExpense}
        onCreate={createRecurringExpense}
      />

      {editingItem && (
        <RecurringExpenseForm
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          onSave={updateRecurringExpense}
          onCreate={createRecurringExpense}
        />
      )}

      <MarkDoneModal
        isOpen={!!markingDoneItem}
        onClose={() => setMarkingDoneItem(null)}
        item={markingDoneItem}
        onConfirm={markAsDone}
      />
    </>
  );
}
