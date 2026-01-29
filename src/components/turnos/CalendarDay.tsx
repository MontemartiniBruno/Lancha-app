'use client';

import { Badge } from '@/components/ui/Badge';
import { esFeriado } from '@/lib/holidays';
import { format, isSameDay } from 'date-fns';
import type { Turn, User } from '@/types';
import { cn } from '@/lib/utils';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isWeekendOrHoliday: boolean;
  isHoliday: boolean;
  turn: Turn | undefined;
  users: User[];
  isSelected: boolean;
  onClick: () => void;
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isWeekendOrHoliday,
  isHoliday,
  turn,
  users,
  isSelected,
  onClick,
}: CalendarDayProps) {
  const today = new Date();
  const isToday = isSameDay(date, today);
  const user = turn?.assigned_to ? users.find(u => u.id === turn.assigned_to) : null;

  if (!isCurrentMonth) {
    return (
      <div className="aspect-square p-1">
        <div className="h-full rounded-lg bg-gray-50 opacity-50" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "aspect-square p-1 cursor-pointer touch-manipulation",
        isSelected && "ring-2 ring-primary-500"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "h-full rounded-lg p-1 md:p-2 flex flex-col items-center justify-center",
          "transition-colors hover:bg-gray-100 active:bg-gray-200",
          isToday && "ring-2 ring-primary-300",
          !isWeekendOrHoliday && "bg-gray-50"
        )}
      >
        <span
          className={cn(
            "text-xs md:text-sm font-medium mb-1",
            isToday && "text-primary-600 font-bold",
            !isCurrentMonth && "text-gray-400"
          )}
        >
          {format(date, 'd')}
        </span>
        
        <div className="flex flex-col items-center gap-0.5 w-full">
          {isWeekendOrHoliday && isHoliday && (
            <Badge variant="holiday" className="text-[10px] px-1 py-0">
              🎉
            </Badge>
          )}
          {turn && (
            <Badge
              variant={turn.type === 'private' ? 'private' : 'shared'}
              className="text-[10px] px-1 py-0 w-full truncate"
            >
              {turn.type === 'private' ? (user?.name.charAt(0) || '?') : '👥'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
