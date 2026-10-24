import type { HiveMaintenanceType } from '../types/hive-maintenance';

export function getMaintenanceTypeLabel(type: HiveMaintenanceType | string) {
  switch (normalizeMaintenanceType(type)) {
    case 'PAINTING':
      return 'Farbanje';
    case 'FLOOR_REPAIR':
      return 'Popravka poda';
    case 'LID_REPLACEMENT':
      return 'Zamena poklopca';
    case 'ENTRANCE_REPLACEMENT':
      return 'Zamena leta';
    case 'VARROA_SCREEN_INSTALLATION':
      return 'Ugradnja mreže protiv varoe';
    case 'DISINFECTION':
      return 'Dezinfekcija';
    case 'REPAIR':
      return 'Popravka';
    case 'OTHER':
      return 'Drugo';
    default:
      return type;
  }
}

function normalizeMaintenanceType(type: string) {
  return type
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}
