import { formatDateOnlyForDisplay } from '@/shared/utils/date-only';

export function formatHarvestDate(value: string | null | undefined) {
  return value ? formatDateOnlyForDisplay(value) : 'Nije poznato';
}

export function formatPeriod(start: string | null, end: string | null) {
  if (!start && !end) return 'Period nije dostupan';
  if (start === end) return formatHarvestDate(start);
  return `${formatHarvestDate(start)} – ${formatHarvestDate(end)}`;
}

export function formatAmount(amount: number, unit: string) {
  return `${new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: 3 }).format(amount)} ${unit}`;
}

export function getBatchStatusLabel(status: string) {
  switch (status.toLocaleLowerCase()) {
    case 'open':
      return 'Otvorena';
    case 'finalized':
      return 'Završena';
    default:
      return status;
  }
}

export function hasDistinctBatchName(name: string, batchCode: string) {
  return name.trim().localeCompare(batchCode.trim(), 'sr-Latn-RS', { sensitivity: 'accent' }) !== 0;
}

export function formatBatchIdentity(name: string, batchCode: string) {
  return hasDistinctBatchName(name, batchCode) ? `${batchCode} · ${name}` : batchCode;
}

const forageLabels: Record<string, string> = {
  meadow: 'Livada',
  forest: 'Šuma',
  sunflower: 'Suncokret',
  acacia: 'Bagrem',
  linden: 'Lipa',
  oilseedrape: 'Uljana repica',
  clover: 'Detelina',
  fruittrees: 'Voćke',
  chestnut: 'Kesten',
  buckwheat: 'Heljda',
  other: 'Ostalo',
};

export function getForageLabel(value: string) {
  return forageLabels[value.toLocaleLowerCase()] ?? value;
}

export function getDeterminationMethodLabel(value: string) {
  switch (value.toLocaleLowerCase()) {
    case 'calculated':
      return 'Izračunato';
    case 'manual':
      return 'Ručno';
    case 'laboratory':
      return 'Laboratorijski';
    default:
      return value;
  }
}
