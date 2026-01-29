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
