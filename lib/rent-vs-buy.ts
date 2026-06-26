export const HOURS_PER_MONTH = 730;
export const HOURS_PER_YEAR = 8760;
export const MINUTES_PER_HOUR = 60;

export const DEFAULT_HOURLY_RATE = 0.65;
export const DEFAULT_PURCHASE_PRICE = 4699;

export type RentPriceUnit = 'minute' | 'hour' | 'month' | 'year';

export function hourlyRateFromUnit(price: number, unit: RentPriceUnit): number {
  if (!Number.isFinite(price) || price < 0) return 0;
  switch (unit) {
    case 'minute':
      return price * MINUTES_PER_HOUR;
    case 'hour':
      return price;
    case 'month':
      return price / HOURS_PER_MONTH;
    case 'year':
      return price / HOURS_PER_YEAR;
  }
}

export function priceFromHourly(hourly: number, unit: RentPriceUnit): number {
  switch (unit) {
    case 'minute':
      return hourly / MINUTES_PER_HOUR;
    case 'hour':
      return hourly;
    case 'month':
      return hourly * HOURS_PER_MONTH;
    case 'year':
      return hourly * HOURS_PER_YEAR;
  }
}

export function rentCost(hours: number, hourlyRate: number): number {
  return hours * hourlyRate;
}

export function breakEvenHours(purchasePrice: number, hourlyRate: number): number | null {
  if (hourlyRate <= 0 || purchasePrice <= 0) return null;
  return purchasePrice / hourlyRate;
}

export function breakEvenMonths(purchasePrice: number, hourlyRate: number, hoursPerMonth: number): number | null {
  const hours = breakEvenHours(purchasePrice, hourlyRate);
  if (hours === null || hoursPerMonth <= 0) return null;
  return hours / hoursPerMonth;
}

export interface UsageScenario {
  label: string;
  hoursPerMonth: number;
}

export const USAGE_SCENARIOS: UsageScenario[] = [
  { label: 'Light (20 h/mo)', hoursPerMonth: 20 },
  { label: 'Part-time (80 h/mo)', hoursPerMonth: 80 },
  { label: 'Full work week (160 h/mo)', hoursPerMonth: 160 },
  { label: 'Heavy (320 h/mo)', hoursPerMonth: 320 },
  { label: 'Always on (730 h/mo)', hoursPerMonth: 730 },
];

export function formatUsd(value: number, digits = 0): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatHours(value: number): string {
  if (value >= HOURS_PER_YEAR) {
    const years = value / HOURS_PER_YEAR;
    return `${years.toFixed(1)} years`;
  }
  if (value >= HOURS_PER_MONTH) {
    const months = value / HOURS_PER_MONTH;
    return `${months.toFixed(1)} months`;
  }
  return `${Math.round(value)} hours`;
}
