export type HiveEntranceOrientation =
  | 'north'
  | 'northEast'
  | 'east'
  | 'southEast'
  | 'south'
  | 'southWest'
  | 'west'
  | 'northWest';

export type CurrentApiaryStay = {
  id: string;
  apiaryId: string;
  locationId: string;

  startedAtUtc: string;

  endedAtUtc:
    | string
    | null;

  orientation:
    | HiveEntranceOrientation
    | null;

  note:
    | string
    | null;

  isActive: boolean;

  createdAtUtc: string;

  updatedAtUtc:
    | string
    | null;
};

export type ApiaryStayHistoryItem = {
  id: string;
  locationName: string | null;
  altitudeMeters: number | null;
  startedAtUtc: string;
  endedAtUtc: string | null;
  orientation: HiveEntranceOrientation | null;
  isActive: boolean;
  daysSpent: number;
};

export type ApiaryStayHistoryPage = {
  items: ApiaryStayHistoryItem[];
  page: number;
  hasNextPage: boolean;
};
