import { esFinDeSemanaOFeriado } from './holidays';
import type { User, Turn } from '@/types';

function getDiasSorteables(year: number, month: number): Date[] {
  const dias: Date[] = [];
  const ultimoDia = new Date(year, month + 1, 0).getDate();
  
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const fecha = new Date(year, month, dia);
    if (esFinDeSemanaOFeriado(fecha)) {
      dias.push(fecha);
    }
  }
  
  return dias;
}

export function sortearMes(
  year: number,
  month: number,
  users: User[]
): Omit<Turn, 'id' | 'created_at'>[] {
  const diasSorteables = getDiasSorteables(year, month);
  const totalDias = diasSorteables.length;
  
  const cantPrivados = Math.round(totalDias * 0.6);
  const cantCompartidos = totalDias - cantPrivados;
  
  // Shuffle Fisher-Yates
  const shuffle = [...diasSorteables].sort(() => Math.random() - 0.5);
  
  const turnos: Omit<Turn, 'id' | 'created_at'>[] = [];
  
  // Privados con round-robin
  for (let i = 0; i < cantPrivados; i++) {
    const date = shuffle[i];
    turnos.push({
      turn_date: date.toISOString().split('T')[0],
      type: 'private',
      assigned_to: users[i % users.length].id,
      notes: null,
    });
  }
  
  // Compartidos
  for (let i = cantPrivados; i < totalDias; i++) {
    const date = shuffle[i];
    turnos.push({
      turn_date: date.toISOString().split('T')[0],
      type: 'shared',
      assigned_to: null,
      notes: null,
    });
  }
  
  return turnos;
}
