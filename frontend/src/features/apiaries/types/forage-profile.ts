export type ForageType =
  | 'meadow'
  | 'forest'
  | 'sunflower'
  | 'acacia'
  | 'linden'
  | 'oilseedRape'
  | 'clover'
  | 'fruitTrees'
  | 'chestnut'
  | 'buckwheat'
  | 'other';

export type ForageProfileItem = {
  id: string;

  forageType: ForageType;

  percentage: number;

  intensity: number;

  notes: string | null;
};

export type ForageProfile = {
  id: string;

  year: number;

  radiusKm: number | null;

  name: string;

  notes: string | null;

  isLocked: boolean;

  apiaryStayId: string;

  items: ForageProfileItem[];

  availableYears: number[];
};

export type CreateForageProfileItemRequest = {
  forageType: Exclude<ForageType, 'other'>;

  percentage: number;

  intensity: number;

  notes: string | null;
};

export type CreateForageProfileRequest = {
  year: number;

  radiusKm: number | null;

  name: string;

  notes: string | null;

  items: CreateForageProfileItemRequest[];
};
