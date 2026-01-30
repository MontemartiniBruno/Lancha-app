'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useMovements } from '@/hooks/useMovements';
import { useToastContext } from '@/components/providers/ToastProvider';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import type { Movement } from '@/types';

export function RecentMovements() {
  const { movements, loading, updateReceipt, refresh } = useMovements();
  const { success, error } = useToastContext();
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (loading) {
    return (
      <Card title="💸 Últimos Movimientos">
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }
  
  const recentMovements = movements?.slice(0, 7) || [];
  
  const handleMovementClick = (movement: Movement) => {
    setSelectedMovement(movement);
    setShowModal(true);
  };

  const handleAttachReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMovement || !e.target.files?.[0]) return;
    
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
        selectedMovement.id,
        selectedMovement.type,
        urlData.publicUrl
      );
      
      if (result?.error) {
        error('Error al actualizar el movimiento');
      } else {
        success('✅ Comprobante adjuntado exitosamente');
        // Actualizar el movimiento seleccionado para reflejar el cambio
        setSelectedMovement({
          ...selectedMovement,
          receipt_url: urlData.publicUrl,
        });
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
  
  return (
    <>
      <Card title="💸 Últimos Movimientos">
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {recentMovements.length > 0 ? (
            recentMovements.map((movement, index) => {
              const date = parseISO(movement.date);
              const isPositive = movement.amount > 0;
              
              return (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2 md:py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleMovementClick(movement)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-800 truncate">{movement.description}</div>
                      {movement.receipt_url && (
                        <span className="text-xs text-blue-600">📎</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(date, "dd/MM/yyyy", { locale: es })}
                    </div>
                  </div>
                  <div className={`font-semibold text-sm md:text-base ml-4 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}${Math.abs(movement.amount).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">No hay movimientos</div>
          )}
        </div>
      </Card>
      
      {selectedMovement && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{selectedMovement.description}</h3>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-sm text-gray-500">Fecha</div>
                <div className="font-medium">
                  {format(parseISO(selectedMovement.date), "dd/MM/yyyy", { locale: es })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Monto</div>
                <div className={`font-semibold text-lg ${
                  selectedMovement.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedMovement.amount > 0 ? '+' : ''}${Math.abs(selectedMovement.amount).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Tipo</div>
                <div className="font-medium">
                  {selectedMovement.type === 'transfer' ? 'Transferencia' : 'Gasto'}
                </div>
              </div>
            </div>
            {selectedMovement.notes && (
              <div className="mt-4">
                <div className="text-sm text-gray-500">Notas</div>
                <div className="font-medium text-gray-800 mt-1 p-2 bg-gray-50 rounded">
                  {selectedMovement.notes}
                </div>
              </div>
            )}
            <div className="mt-4">
              {selectedMovement.receipt_url ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Comprobante</h4>
                  <img 
                    src={selectedMovement.receipt_url} 
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
                      id="receipt-upload-dashboard"
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
      )}
    </>
  );
}
