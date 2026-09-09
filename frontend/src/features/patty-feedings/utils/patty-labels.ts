import type { PattyType } from '../types/patty-feeding';

const pattyTypeLabels: Record<PattyType, string> = {
  sugar: 'Šećerna',
  protein: 'Proteinska',
  honey: 'Medna',
  medicated: 'Sa lekom',
  invertSugar: 'Od invertnog šećera',
  other: 'Druga',
};

export function getPattyTypeLabel(type: PattyType | null) {
  return type ? pattyTypeLabels[type] : 'Nije navedena';
}
