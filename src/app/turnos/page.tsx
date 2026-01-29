'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/turnos/Calendar';
import { SorteoButton } from '@/components/turnos/SorteoButton';
import { ManualTurnForm } from '@/components/turnos/ManualTurnForm';
import { TurnEditModal } from '@/components/turnos/TurnEditModal';
import { useTurns } from '@/hooks/useTurns';

export default function TurnosPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { turns, refresh } = useTurns();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Forzar refresh cuando se cierra el modal de edición o cuando cambia el mes
  useEffect(() => {
    if (!showEditModal) {
      refresh();
      setRefreshKey(prev => prev + 1);
    }
  }, [showEditModal, refresh]);
  
  // Refrescar cuando cambia el mes
  useEffect(() => {
    refresh();
  }, [selectedMonth, refresh]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const turn = turns?.find(t => t.turn_date === dateStr);
    setShowEditModal(true);
  };

  const getTurnForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return turns?.find(t => t.turn_date === dateStr);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 pb-20 md:pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Turnos</h1>
        <SorteoButton month={selectedMonth} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Calendar 
            month={selectedMonth} 
            onMonthChange={setSelectedMonth}
            onDateClick={handleDateClick}
          />
        </div>
        <div className="lg:col-span-1">
          <ManualTurnForm onTurnAdded={refresh} />
        </div>
      </div>

      <TurnEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDate(null);
        }}
        turn={selectedDate ? getTurnForDate(selectedDate) || null : null}
        date={selectedDate}
      />
    </div>
  );
}
