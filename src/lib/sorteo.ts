import { getFinesDeSemana, esFeriado, esFinDeSemanaOFeriado } from './holidays';
import type { User, Turn } from '@/types';

export function sortearAno(
  year: number,
  users: User[]
): Omit<Turn, 'id' | 'created_at'>[] {
  const turnos: Omit<Turn, 'id' | 'created_at'>[] = [];
  const fechasAsignadas = new Set<string>(); // Para evitar duplicados
  
  const finesDeSemana = getFinesDeSemana(year);
  
  // Separar fines de semana regulares y largos
  const finesDeSemanaRegulares = finesDeSemana.filter(fs => !fs.esLargo);
  const finesDeSemanaLargos = finesDeSemana.filter(fs => fs.esLargo);
  
  // Distribuir equitativamente los fines de semana largos entre los usuarios
  const asignacionesLargos: { [userId: string]: number } = {};
  users.forEach(u => { asignacionesLargos[u.id] = 0; });
  
  // Shuffle de fines de semana largos para distribución aleatoria
  const largosShuffled = [...finesDeSemanaLargos].sort(() => Math.random() - 0.5);
  
  // Asignar fines de semana largos de forma equitativa
  largosShuffled.forEach((fs) => {
    // Encontrar el usuario con menos asignaciones
    const userId = users.reduce((min, u) => 
      asignacionesLargos[u.id] < asignacionesLargos[min.id] ? u : min
    ).id;
    
    asignacionesLargos[userId]++;
    
    // Asignar turnos del fin de semana largo
    // Regla: puede tener 2 privados pero siempre 1 compartido
    const diasDisponibles: Date[] = [];
    
    // Agregar sábado y domingo
    if (!fechasAsignadas.has(fs.sabado.toISOString().split('T')[0])) {
      diasDisponibles.push(fs.sabado);
    }
    if (!fechasAsignadas.has(fs.domingo.toISOString().split('T')[0])) {
      diasDisponibles.push(fs.domingo);
    }
    
    // Agregar días adicionales si hay feriados adyacentes (solo si no están ya asignados)
    const viernes = new Date(fs.sabado);
    viernes.setDate(viernes.getDate() - 1);
    const viernesStr = viernes.toISOString().split('T')[0];
    if (esFeriado(viernes) && !fechasAsignadas.has(viernesStr)) {
      diasDisponibles.push(viernes);
    }
    
    const lunes = new Date(fs.domingo);
    lunes.setDate(lunes.getDate() + 1);
    const lunesStr = lunes.toISOString().split('T')[0];
    if (esFeriado(lunes) && !fechasAsignadas.has(lunesStr)) {
      diasDisponibles.push(lunes);
    }
    
    // Shuffle días disponibles
    const diasShuffled = [...diasDisponibles].sort(() => Math.random() - 0.5);
    
    // Asignar 1 compartido (obligatorio)
    if (diasShuffled.length > 0) {
      const diaCompartido = diasShuffled.pop()!;
      const fechaStr = diaCompartido.toISOString().split('T')[0];
      fechasAsignadas.add(fechaStr);
      turnos.push({
        turn_date: fechaStr,
        type: 'shared',
        assigned_to: null,
        notes: undefined,
      });
    }
    
    // Asignar privados (hasta 2, según disponibilidad)
    const cantPrivados = Math.min(2, diasShuffled.length);
    for (let i = 0; i < cantPrivados; i++) {
      const dia = diasShuffled[i];
      const fechaStr = dia.toISOString().split('T')[0];
      fechasAsignadas.add(fechaStr);
      turnos.push({
        turn_date: fechaStr,
        type: 'private',
        assigned_to: userId,
        notes: undefined,
      });
    }
  });
  
  // Procesar fines de semana regulares
  // Regla: 1 privado + 1 compartido (no puede tener 2 privados ni 2 compartidos)
  const usuariosShuffled = [...users].sort(() => Math.random() - 0.5);
  let usuarioIndex = 0;
  
  finesDeSemanaRegulares.forEach(fs => {
    // Solo procesar si no están ya asignados (pueden estar en fines de semana largos)
    const sabadoStr = fs.sabado.toISOString().split('T')[0];
    const domingoStr = fs.domingo.toISOString().split('T')[0];
    
    if (fechasAsignadas.has(sabadoStr) || fechasAsignadas.has(domingoStr)) {
      return; // Ya asignado en un fin de semana largo
    }
    
    // Decidir aleatoriamente qué día es privado y cuál compartido
    const esSabadoPrivado = Math.random() < 0.5;
    
    if (esSabadoPrivado) {
      // Sábado privado, domingo compartido
      fechasAsignadas.add(sabadoStr);
      fechasAsignadas.add(domingoStr);
      turnos.push({
        turn_date: sabadoStr,
        type: 'private',
        assigned_to: usuariosShuffled[usuarioIndex % usuariosShuffled.length].id,
        notes: undefined,
      });
      turnos.push({
        turn_date: domingoStr,
        type: 'shared',
        assigned_to: null,
        notes: undefined,
      });
    } else {
      // Sábado compartido, domingo privado
      fechasAsignadas.add(sabadoStr);
      fechasAsignadas.add(domingoStr);
      turnos.push({
        turn_date: sabadoStr,
        type: 'shared',
        assigned_to: null,
        notes: undefined,
      });
      turnos.push({
        turn_date: domingoStr,
        type: 'private',
        assigned_to: usuariosShuffled[usuarioIndex % usuariosShuffled.length].id,
        notes: undefined,
      });
    }
    
    usuarioIndex++;
  });
  
  // Agregar feriados que no están en fines de semana (días de semana que son feriados)
  // Estos se tratan como días compartidos adicionales
  const feriadosNoFinDeSemana: Date[] = [];
  for (let month = 0; month < 12; month++) {
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const fecha = new Date(year, month, day);
      const diaSemana = fecha.getDay();
      // Solo feriados que son días de semana (lunes a viernes, no sábado ni domingo)
      if (esFeriado(fecha) && diaSemana !== 0 && diaSemana !== 6) {
        feriadosNoFinDeSemana.push(fecha);
      }
    }
  }
  
  feriadosNoFinDeSemana.forEach(fecha => {
    const fechaStr = fecha.toISOString().split('T')[0];
    // Solo agregar si no está ya asignado
    if (!fechasAsignadas.has(fechaStr)) {
      fechasAsignadas.add(fechaStr);
      turnos.push({
        turn_date: fechaStr,
        type: 'shared',
        assigned_to: null,
        notes: undefined,
      });
    }
  });
  
  return turnos;
}
