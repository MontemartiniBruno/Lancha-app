'use client';

import { useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useMovements } from '@/hooks/useMovements';
import { useToastContext } from '@/components/providers/ToastProvider';
import { supabase } from '@/lib/supabase';
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
  const { updateReceipt, refresh } = useMovements();
  const { success, error } = useToastContext();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentMovement, setCurrentMovement] = useState<Movement>(movement);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const date = parseISO(movement.date);
  const isPositive = movement.amount > 0;
  
  const handleAttachReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentMovement || !e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      // Subir imagen a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);
      
      if (uploadError) {
        error('Error al subir el comprobante: ' + uploadError.message);
        setUploading(false);
        return;
      }
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);
      
      // Actualizar el movimiento con la URL del comprobante
      const result = await updateReceipt(
        currentMovement.id,
        currentMovement.type,
        urlData.publicUrl
      );
      
      if (result?.error) {
        error('Error al actualizar el movimiento');
      } else {
        success('✅ Comprobante adjuntado exitosamente');
        // Actualizar el movimiento local para reflejar el cambio
        setCurrentMovement({
          ...currentMovement,
          receipt_url: urlData.publicUrl,
        });
        await refresh();
      }
    } catch (err: any) {
      error('Error: ' + (err.message || 'Error desconocido'));
    } finally {
      setUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMovementClick = () => {
    setCurrentMovement(movement);
    setShowDetailModal(true);
  };

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
      <div 
        className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleMovementClick}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium text-gray-800">{movement.description}</div>
            {movement.receipt_url && (
              <span className="text-xs text-blue-600">📎</span>
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="!p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">{currentMovement.description}</h3>
          <div className="space-y-3 mb-4">
            <div>
              <div className="text-sm text-gray-500">Fecha</div>
              <div className="font-medium">
                {format(parseISO(currentMovement.date), "dd/MM/yyyy", { locale: es })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Monto</div>
              <div className={`font-semibold text-lg ${
                currentMovement.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentMovement.amount > 0 ? '+' : ''}${Math.abs(currentMovement.amount).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Tipo</div>
              <div className="font-medium">
                {currentMovement.type === 'transfer' ? 'Transferencia' : 'Gasto'}
              </div>
            </div>
          </div>
          {currentMovement.notes && (
            <div className="mt-4">
              <div className="text-sm text-gray-500">Notas</div>
              <div className="font-medium text-gray-800 mt-1 p-2 bg-gray-50 rounded">
                {currentMovement.notes}
              </div>
            </div>
          )}
          <div className="mt-4">
            {currentMovement.receipt_url ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Comprobante</h4>
                <img 
                  src={currentMovement.receipt_url} 
                  alt="Comprobante" 
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Comprobante</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">No hay comprobante adjunto</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAttachReceipt}
                    className="hidden"
                    id={`receipt-upload-${currentMovement.id}`}
                    disabled={uploading}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Subiendo...' : '📎 Adjuntar comprobante'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
