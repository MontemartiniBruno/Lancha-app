import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formatea el valor mientras el usuario escribe (para input)
 * Permite escribir números y formatea en tiempo real con $ y separador de miles
 * Ejemplo: "30000" -> "$30.000"
 */
export function formatCurrencyInput(value: string): string {
  // Si está vacío o solo tiene $, retornar solo $
  if (!value || value.trim() === '' || value === '$') return '$';
  
  // Remover todo excepto números
  const numbers = value.replace(/[^\d]/g, '');
  
  if (!numbers) return '$';
  
  // Formatear con separador de miles
  const numValue = parseInt(numbers, 10);
  if (isNaN(numValue) || numValue === 0) return '$';
  
  const formatted = numValue.toLocaleString('es-AR');
  
  return `$${formatted}`;
}

/**
 * Parsea un valor formateado (con $ y puntos) a número
 * Ejemplo: "$30.000" -> 30000
 */
export function parseCurrency(value: string): number {
  // Remover $, puntos y espacios, mantener solo números
  const cleaned = value.replace(/[^\d]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
