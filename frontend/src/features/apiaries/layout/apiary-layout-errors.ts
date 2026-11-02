import { ApiError } from '@/shared/api/api-error';

import type { ApiaryLayoutCollisionViolation } from '../types/apiary-layout';

function isCollisionViolation(value: unknown): value is ApiaryLayoutCollisionViolation {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'hiveId' in value &&
    typeof value.hiveId === 'string' &&
    'conflictingHiveId' in value &&
    typeof value.conflictingHiveId === 'string'
  );
}

export function getApiaryLayoutCollisionViolations(
  error: unknown,
): ApiaryLayoutCollisionViolation[] | null {
  if (
    !(error instanceof ApiError) ||
    error.problem?.code !== 'apiaries.layout_collision' ||
    !Array.isArray(error.problem.violations) ||
    !error.problem.violations.every(isCollisionViolation)
  ) {
    return null;
  }

  return error.problem.violations;
}
