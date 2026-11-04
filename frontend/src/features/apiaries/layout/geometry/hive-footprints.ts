export type HiveFootprint = Readonly<{ width: number; height: number }>;

// Keep these aligned with the Apiaries backend HiveFootprintCatalog and geometry validator.
export const STANDARD_HIVE_FOOTPRINT: HiveFootprint = { width: 80, height: 80 };
export const MINIMUM_HIVE_SPACING = 10;

export function resolveHiveFootprint(_hiveType: string): HiveFootprint {
  'worklet';
  return STANDARD_HIVE_FOOTPRINT;
}
