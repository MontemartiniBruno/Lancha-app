'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastContext } from '@/components/providers/ToastProvider';
import type { BoatInfo } from '@/types';

export function BoatInfo() {
  const { success, error } = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState<BoatInfo | null>(null);
  const [editData, setEditData] = useState({
    model: '',
    motor: '',
    matricula: '',
    last_service: '',
    next_service: '',
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBoatInfo();
  }, []);
  
  async function fetchBoatInfo() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('boat_info')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching boat info:', fetchError);
        return;
      }
      
      if (data) {
        setInfo(data);
        setEditData({
          model: data.model || '',
          motor: data.motor || '',
          matricula: data.matricula || '',
          last_service: data.last_service || '',
          next_service: data.next_service || '',
        });
      } else {
        // Crear registro inicial si no existe
        const defaultData = {
          model: 'Cargo 520 2024',
          motor: 'Mercury 60 4t',
          matricula: '',
          last_service: '02/2026',
          next_service: '02/2027',
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('boat_info')
          .insert({ id: 1, ...defaultData })
          .select()
          .single();
        
        if (!insertError && newData) {
          setInfo(newData);
          setEditData(defaultData);
        }
      }
    } catch (err) {
      console.error('Error fetching boat info:', err);
    } finally {
      setLoading(false);
    }
  }
  
  const handleSave = async () => {
    try {
      const { error: upsertError } = await supabase
        .from('boat_info')
        .upsert({ 
          id: 1, 
          ...editData,
          updated_at: new Date().toISOString(),
        });
      
      if (upsertError) {
        error('Error al guardar: ' + upsertError.message);
        return;
      }
      
      setInfo({
        id: 1,
        ...editData,
        updated_at: new Date().toISOString(),
      } as BoatInfo);
      setIsEditing(false);
      success('✅ Información actualizada');
    } catch (err: any) {
      error('Error: ' + (err.message || 'Error desconocido'));
    }
  };
  
  if (loading) {
    return (
      <Card>
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">🚤 Ficha Técnica</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (isEditing) {
                // Cancelar: restaurar datos originales
                if (info) {
                  setEditData({
                    model: info.model || '',
                    motor: info.motor || '',
                    matricula: info.matricula || '',
                    last_service: info.last_service || '',
                    next_service: info.next_service || '',
                  });
                }
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <Input
              label="Modelo"
              type="text"
              value={editData.model}
              onChange={(e) => setEditData({ ...editData, model: e.target.value })}
            />
            
            <Input
              label="Motor"
              type="text"
              value={editData.motor}
              onChange={(e) => setEditData({ ...editData, motor: e.target.value })}
            />
            
            <Input
              label="Matrícula"
              type="text"
              value={editData.matricula}
              onChange={(e) => setEditData({ ...editData, matricula: e.target.value })}
              placeholder="Ej: ABC-1234"
            />
            
            <Input
              label="Último Service"
              type="text"
              value={editData.last_service}
              onChange={(e) => setEditData({ ...editData, last_service: e.target.value })}
              placeholder="MM/AAAA"
            />
            
            <Input
              label="Próximo Service"
              type="text"
              value={editData.next_service}
              onChange={(e) => setEditData({ ...editData, next_service: e.target.value })}
              placeholder="MM/AAAA"
            />
            
            <Button onClick={handleSave} fullWidth>
              Guardar Cambios
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Modelo</div>
                <div className="font-medium text-gray-800">{info?.model || '-'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Motor</div>
                <div className="font-medium text-gray-800">{info?.motor || '-'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Matrícula</div>
                <div className="font-medium text-gray-800">{info?.matricula || '-'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Último Service</div>
                <div className="font-medium text-gray-800">{info?.last_service || '-'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Próximo Service</div>
                <div className="font-medium text-orange-600">
                  {info?.next_service || '-'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
