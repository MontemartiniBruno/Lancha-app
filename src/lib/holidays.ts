// Feriados Argentina 2026
export const FERIADOS_2026 = [
  '2026-01-01', // Año Nuevo
  '2026-02-16', '2026-02-17', // Carnaval
  '2026-03-24', // Memoria, Verdad y Justicia
  '2026-04-02', // Malvinas
  '2026-04-03', '2026-04-05', '2026-04-06', // Semana Santa
  '2026-05-01', // Día del Trabajador
  '2026-05-25', // Revolución de Mayo
  '2026-06-15', // Güemes (lunes siguiente)
  '2026-06-20', // Día de la Bandera
  '2026-07-09', // Independencia
  '2026-08-17', // San Martín (lunes siguiente)
  '2026-10-12', // Diversidad Cultural (lunes siguiente)
  '2026-11-23', // Soberanía Nacional (lunes siguiente)
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25', // Navidad
];

export function esFeriado(date: Date): boolean {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  return FERIADOS_2026.includes(dateStr);
}

export function esFinDeSemanaOFeriado(date: Date): boolean {
  const dia = date.getDay();
  return dia === 0 || dia === 6 || esFeriado(date);
}

// Obtener el sábado de un fin de semana (si es domingo, devuelve el sábado anterior)
export function getSabadoDelFinDeSemana(date: Date): Date {
  const dia = date.getDay();
  if (dia === 6) return new Date(date);
  if (dia === 0) {
    const sabado = new Date(date);
    sabado.setDate(sabado.getDate() - 1);
    return sabado;
  }
  return date;
}

// Verificar si un fin de semana es largo (tiene feriado el viernes o lunes, o feriado en sábado/domingo)
export function esFinDeSemanaLargo(sabado: Date): boolean {
  const domingo = new Date(sabado);
  domingo.setDate(domingo.getDate() + 1);
  
  const viernes = new Date(sabado);
  viernes.setDate(viernes.getDate() - 1);
  
  const lunes = new Date(domingo);
  lunes.setDate(lunes.getDate() + 1);
  
  // Es fin de semana largo si:
  // - Hay feriado en viernes, sábado, domingo o lunes
  return esFeriado(viernes) || esFeriado(sabado) || esFeriado(domingo) || esFeriado(lunes);
}

// Obtener todos los fines de semana de un año
export function getFinesDeSemana(year: number): { sabado: Date; domingo: Date; esLargo: boolean }[] {
  const finesDeSemana: { sabado: Date; domingo: Date; esLargo: boolean }[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Encontrar el primer sábado del año
  let currentDate = new Date(startDate);
  while (currentDate.getDay() !== 6) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Iterar por todos los sábados del año
  while (currentDate <= endDate) {
    const sabado = new Date(currentDate);
    const domingo = new Date(currentDate);
    domingo.setDate(domingo.getDate() + 1);
    
    finesDeSemana.push({
      sabado,
      domingo,
      esLargo: esFinDeSemanaLargo(sabado),
    });
    
    // Siguiente sábado
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return finesDeSemana;
}
