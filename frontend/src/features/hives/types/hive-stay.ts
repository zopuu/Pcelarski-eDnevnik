export type HiveStayHistoryItem = {
  id: string;
  apiaryId: string;
  apiaryName: string | null;
  apiaryImageUrl: string | null;
  startedAtUtc: string;
  endedAtUtc: string | null;
  note: string | null;
  isActive: boolean;
  daysSpent: number;
};

export type HiveStayHistoryPage = {
  items: HiveStayHistoryItem[];
  page: number;
  hasNextPage: boolean;
};
