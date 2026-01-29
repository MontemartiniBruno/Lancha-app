'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { CalendarDay } from './CalendarDay';
import { useTurns } from '@/hooks/useTurns';
import { esFinDeSemanaOFeriado, esFeriado } from '@/lib/holidays';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface CalendarProps {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDateClick?: (date: Date) => void;
}

export function Calendar({ month, onMonthChange, onDateClick }: CalendarProps) {
  const { turns, users } = useTurns();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // No necesitamos refrescar aquí, el hook useTurns ya carga los datos al montar
  // y se actualizan cuando se hacen cambios

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Agregar días del mes anterior para completar la primera semana
  const firstDayOfWeek = getDay(monthStart);
  const daysBefore = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const previousMonthDays: Date[] = [];
  for (let i = daysBefore - 1; i >= 0; i--) {
    previousMonthDays.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), -i));
  }

  const allDays = [...previousMonthDays, ...daysInMonth];

  const handlePreviousMonth = () => {
    const newDate = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    onMonthChange(newDate);
  };

  const getTurnForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return turns?.find(t => t.turn_date === dateStr);
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <Card>
      <div className="p-4 md:p-6">
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 capitalize">
            {format(month, "MMMM yyyy", { locale: es })}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 md:gap-3 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {allDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, month);
            const isWeekendOrHoliday = esFinDeSemanaOFeriado(date);
            const isHoliday = esFeriado(date);
            const turn = getTurnForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <CalendarDay
                key={index}
                date={date}
                isCurrentMonth={isCurrentMonth}
                isWeekendOrHoliday={isWeekendOrHoliday}
                isHoliday={isHoliday}
                turn={turn}
                users={users || []}
                isSelected={isSelected || false}
                onClick={() => {
                  setSelectedDate(date);
                  onDateClick?.(date);
                }}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
