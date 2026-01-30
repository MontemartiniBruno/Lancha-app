'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Movement } from '@/types';

interface MovementItemProps {
  movement: Movement;
  onDelete: () => void;
  onCancel?: () => void;
  movementId?: string;
  movementType: 'transfer' | 'expense';
  showConfirm?: boolean;
}

export function MovementItem({ movement, onDelete, onCancel, movementType, showConfirm }: MovementItemProps) {
  const [showImage, setShowImage] = useState(false);
  const date = parseISO(movement.date);
  const isPositive = movement.amount > 0;
  
  if (showConfirm) {
    return (
      <div className="border-b border-gray-100 last:border-0 py-3">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium mb-3">
            ¿Estás seguro de eliminar este movimiento?
          </p>
          <div className="flex gap-2">
            <Button
              onClick={onDelete}
              variant="danger"
              size="sm"
            >
              Sí, eliminar
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="secondary"
                size="sm"
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium text-gray-800">{movement.description}</div>
            {movement.receipt_url && (
              <button
                onClick={() => setShowImage(true)}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
              >
                📎 Ver comprobante
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {format(date, "dd/MM/yyyy", { locale: es })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`font-semibold text-right ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}${Math.abs(movement.amount).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            className="!p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {movement.receipt_url && (
        <Modal isOpen={showImage} onClose={() => setShowImage(false)}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Comprobante</h3>
            <img 
              src={movement.receipt_url} 
              alt="Comprobante" 
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
