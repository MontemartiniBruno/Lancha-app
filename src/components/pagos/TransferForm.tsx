'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useMovements } from '@/hooks/useMovements';
import { useBalance } from '@/hooks/useBalance';
import { useToastContext } from '@/components/providers/ToastProvider';
import { supabase } from '@/lib/supabase';
import { formatCurrencyInput, parseCurrency } from '@/lib/utils';

export function TransferForm() {
  const { addTransfer, refresh } = useMovements();
  const { refresh: refreshBalance } = useBalance();
  const { success, error } = useToastContext();
  const [userType, setUserType] = useState<'registered' | 'other'>('registered');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customName, setCustomName] = useState('');
  const [amount, setAmount] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  // Cargar usuarios
  useEffect(() => {
    supabase
      .from('users')
      .select('id, name')
      .then(({ data }) => {
        if (data) setUsers(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userType === 'registered' && !selectedUserId) {
      error('Por favor selecciona un usuario');
      return;
    }
    
    if (userType === 'other' && !customName.trim()) {
      error('Por favor ingresa un nombre');
      return;
    }
    
    if (!amount || amount === '$' || !transferDate) {
      error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    try {
      let receiptUrl = null;
      
      // 1. Subir imagen si existe
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);
        
        if (uploadError) {
          error('Error al subir el comprobante: ' + uploadError.message);
          setLoading(false);
          return;
        }
        
        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);
        
        receiptUrl = urlData.publicUrl;
      }
      
      // 2. Parsear el monto formateado a número
      const parsedAmount = parseCurrency(amount);
      
      if (parsedAmount <= 0) {
        error('El monto debe ser mayor a 0');
        setLoading(false);
        return;
      }
      
      // 3. Insertar transferencia
      const result = await addTransfer({
        user_id: userType === 'registered' ? selectedUserId : null,
        custom_name: userType === 'other' ? customName.trim() : null,
        amount: parsedAmount,
        transfer_date: transferDate,
        notes: notes || undefined,
        receipt_url: receiptUrl || undefined,
      });

      if (!result.error) {
        // Reset form
        setSelectedUserId('');
        setCustomName('');
        setAmount('');
        setTransferDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setReceiptFile(null);
        setUserType('registered');
        await refreshBalance();
        success('Transferencia registrada exitosamente');
      } else {
        error('Error al registrar la transferencia');
      }
    } catch (err: any) {
      error('Error: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Registrar Transferencia">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Tipo de usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transferencia de:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="registered"
                checked={userType === 'registered'}
                onChange={(e) => setUserType(e.target.value as 'registered' | 'other')}
                className="mr-2"
              />
              Copropietario
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="other"
                checked={userType === 'other'}
                onChange={(e) => setUserType(e.target.value as 'registered' | 'other')}
                className="mr-2"
              />
              Otro
            </label>
          </div>
        </div>
        
        {/* Select o Input según tipo */}
        {userType === 'registered' ? (
          <Select
            label="Usuario"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            <option value="">Seleccionar usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            label="Nombre"
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ej: Mamá, Amigo, etc"
            required
          />
        )}

        <Input
          label="Monto"
          type="text"
          value={amount}
          onChange={(e) => {
            const formatted = formatCurrencyInput(e.target.value);
            setAmount(formatted);
          }}
          onBlur={(e) => {
            // Asegurar que siempre tenga el formato correcto al perder el foco
            if (e.target.value && e.target.value !== '$') {
              const formatted = formatCurrencyInput(e.target.value);
              setAmount(formatted);
            }
          }}
          placeholder="$0"
          required
        />

        <Input
          label="Fecha"
          type="date"
          value={transferDate}
          onChange={(e) => setTransferDate(e.target.value)}
          required
        />

        {/* Comprobante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comprobante (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          {receiptFile && (
            <p className="text-sm text-gray-500 mt-1">
              📎 {receiptFile.name}
            </p>
          )}
        </div>

        <Input
          label="Notas (opcional)"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Subiendo...' : 'Guardar Transferencia'}
        </Button>
      </form>
    </Card>
  );
}
