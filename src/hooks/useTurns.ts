'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { sortearMes } from '@/lib/sorteo';
import type { Turn, User } from '@/types';

export function useTurns() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [upcomingTurns, setUpcomingTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Función interna para fetch que no cambia
  const fetchTurnsInternal = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('turns')
        .select('*')
        .order('turn_date', { ascending: true });
      
      if (data) {
        setTurns(data);
        
        // Próximos turnos
        const today = new Date().toISOString().split('T')[0];
        const upcoming = data
          .filter(t => t.turn_date >= today)
          .slice(0, 4);
        setUpcomingTurns(upcoming);
      }
    } catch (error) {
      console.error('Error fetching turns:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsersInternal = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*');
      
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  useEffect(() => {
    fetchTurnsInternal();
    fetchUsersInternal();
  }, []);
  
  async function sortear(year: number, month: number) {
    if (users.length === 0) {
      await fetchUsersInternal();
    }
    
    if (users.length === 0) return;
    
    try {
      const newTurns = sortearMes(year, month, users);
      
      // Eliminar turnos existentes del mes
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      await supabase
        .from('turns')
        .delete()
        .gte('turn_date', firstDay)
        .lte('turn_date', lastDay);
      
      // Insertar nuevos turnos
      const { error } = await supabase.from('turns').insert(newTurns);
      
      if (error) {
        console.error('Error inserting turns:', error);
        return;
      }
      
      await fetchTurnsInternal();
    } catch (error) {
      console.error('Error sorting turns:', error);
    }
  }
  
  async function updateTurn(id: string, updates: Partial<Turn>) {
    try {
      const { error } = await supabase
        .from('turns')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating turn:', error);
        return;
      }
      
      await fetchTurnsInternal();
    } catch (error) {
      console.error('Error updating turn:', error);
    }
  }
  
  async function deleteTurn(id: string) {
    try {
      const { error } = await supabase
        .from('turns')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting turn:', error);
        return;
      }
      
      await fetchTurnsInternal();
    } catch (error) {
      console.error('Error deleting turn:', error);
    }
  }
  
  async function addManualTurn(turn: Omit<Turn, 'id' | 'created_at'>) {
    try {
      // Verificar si ya existe un turno en esa fecha
      const { data: existingTurn } = await supabase
        .from('turns')
        .select('id')
        .eq('turn_date', turn.turn_date)
        .maybeSingle();
      
      if (existingTurn) {
        // Si existe, actualizar en lugar de insertar
        const { error: updateError } = await supabase
          .from('turns')
          .update({
            type: turn.type,
            assigned_to: turn.assigned_to,
            notes: turn.notes,
          })
          .eq('id', existingTurn.id);
        
        if (updateError) {
          console.error('Error updating turn:', updateError);
          return { error: updateError };
        }
      } else {
        // Si no existe, insertar nuevo
        const { error: insertError } = await supabase.from('turns').insert(turn);
        
        if (insertError) {
          console.error('Error adding turn:', insertError);
          return { error: insertError };
        }
      }
      
      // Refrescar los turnos después de agregar/actualizar
      await fetchTurnsInternal();
      return { error: null };
    } catch (error) {
      console.error('Error adding turn:', error);
      return { error };
    }
  }
  
  // Memoizar refresh para evitar loops infinitos - usa useRef para mantener referencia estable
  const refreshRef = useRef(fetchTurnsInternal);
  refreshRef.current = fetchTurnsInternal;
  
  const refresh = useCallback(() => {
    refreshRef.current();
  }, []); // Sin dependencias, siempre usa la referencia más reciente

  return {
    turns,
    users,
    upcomingTurns,
    loading,
    sortear,
    updateTurn,
    deleteTurn,
    addManualTurn,
    refresh,
  };
}
