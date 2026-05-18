import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes, resolving conflicts using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a currency string (INR).
 */
export function formatCurrency(amount: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Formats a number as a percentage.
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${Number(value).toFixed(decimals)}%`;
}
