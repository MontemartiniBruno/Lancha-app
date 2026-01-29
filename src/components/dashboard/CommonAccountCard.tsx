'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useBalance } from '@/hooks/useBalance';
import { useToast } from '@/hooks/useToast';

export function CommonAccountCard() {
  const { commonBalance, accountInfo, updateAccount, loading } = useBalance();
  const { success, error } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [holderName, setHolderName] = useState('');
  const [cvuAlias, setCvuAlias] = useState('');
  
  // Cargar datos cuando se abre el modal o cuando accountInfo cambia
  useEffect(() => {
    if (accountInfo) {
      setHolderName(accountInfo.holder_name || '');
      setCvuAlias(accountInfo.cvu_alias || '');
    }
  }, [accountInfo, showModal]);
  
  const handleSave = async () => {
    try {
      await updateAccount({ holder_name: holderName, cvu_alias: cvuAlias });
      setShowModal(false);
      success('Cuenta común actualizada exitosamente');
    } catch (err) {
      error('Error al actualizar la cuenta común');
    }
  };
  
  if (loading) {
    return (
      <Card title="💰 Cuenta Común">
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }
  
  return (
    <>
      <Card title="💰 Cuenta Común" onClick={() => setShowModal(true)}>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-800">
            ${commonBalance?.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
          </div>
          <div className="text-sm text-gray-500">
            Click para ver detalles
          </div>
          {accountInfo && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
              <div className="text-gray-600">
                <span className="font-medium">Titular:</span> {accountInfo.holder_name || 'No especificado'}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">CVU/Alias:</span> {accountInfo.cvu_alias || 'No especificado'}
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Editar Cuenta Común">
        <div className="space-y-4">
          <Input
            label="Titular"
            type="text"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Nombre del titular"
          />
          <Input
            label="CVU/Alias"
            type="text"
            value={cvuAlias}
            onChange={(e) => setCvuAlias(e.target.value)}
            placeholder="CVU o Alias"
          />
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              fullWidth
            >
              Guardar
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              variant="secondary"
              fullWidth
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
