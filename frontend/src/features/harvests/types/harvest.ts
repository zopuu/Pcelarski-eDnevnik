export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type HarvestListItem = {
  id: string;
  harvestedOn: string;
  honeyAmount: number;
  unit: string;
  harvestedFrameCount: number;
  superCount: number;
  honeyBatchId: string;
  batchCode: string;
  batchName: string;
};

export type HarvestsResponse = {
  page: PagedResponse<HarvestListItem>;
};

export type HarvestSourceExposureSegment = {
  apiaryStayId: string;
  apiaryId: string;
  locationId: string;
  locationName: string | null;
  latitude: number;
  longitude: number;
  startedOn: string;
  endedOn: string;
  durationDays: number;
};

export type HarvestSource = {
  hiveSuperStayId: string;
  hiveSuperId: string | null;
  hiveId: string | null;
  hiveLabel: string | null;
  superStayStartedOn: string | null;
  superStayEndedOn: string | null;
  framesHarvested: number;
  exposureSegments: HarvestSourceExposureSegment[];
};

export type HarvestSourceIssue = {
  hiveSuperStayId: string;
  code: string;
  message: string;
};

export type HarvestDetails = {
  id: string;
  harvestedOn: string;
  honeyAmount: number;
  unit: string;
  notes: string | null;
  harvestedFrameCount: number;
  superCount: number;
  sourcePeriodStartedOn: string | null;
  sourcePeriodEndedOn: string | null;
  batch: {
    id: string;
    batchCode: string;
    name: string;
    status: string;
  };
  sources: HarvestSource[];
  sourceIssues: HarvestSourceIssue[];
};

export type AvailableHarvestGroup = {
  groupKey: string;
  periodStartedOn: string;
  periodEndedOn: string;
  totalRemainingFrameCount: number;
  superCount: number;
  exposurePath: HarvestGroupExposureSegment[];
  supers: HarvestableSuper[];
};

export type HarvestableSuper = {
  hiveSuperStayId: string;
  hiveSuperId: string;
  hiveId: string;
  hiveLabel: string;
  startedOn: string;
  endedOn: string;
  harvestableFrameCount: number;
  remainingHarvestableFrameCount: number;
};

export type HarvestGroupExposureSegment = {
  order: number;
  periodStartedOn: string;
  periodEndedOn: string;
  minimumDurationDays: number;
  maximumDurationDays: number;
  locations: Array<{
    locationId: string;
    name: string | null;
    latitude: number;
    longitude: number;
  }>;
};

export type AvailableHarvestGroupsResponse = {
  algorithmVersion: string;
  groups: AvailableHarvestGroup[];
  issues: HarvestSourceIssue[];
};

export type CreateHarvestRequest = {
  groupKey: string;
  selectedFrameCount: number;
  harvestedOn: string;
  honeyAmount: number;
  notes: string | null;
};

export type CreateHarvestResponse = {
  harvestId: string;
  honeyBatchId: string;
  batchCode: string;
  createdNewBatch: boolean;
  harvestedOn: string;
  harvestedFrameCount: number;
  honeyAmount: number;
  unit: string;
  batchTotalAmount: number;
  batchPeriodStartedOn: string;
  batchPeriodEndedOn: string;
  remainingFramesInSourceGroup: number;
  sources: Array<{
    hiveSuperStayId: string;
    hiveSuperId: string;
    hiveId: string;
    hiveLabel: string;
    framesHarvested: number;
  }>;
};

export type HoneyBatchListItem = {
  id: string;
  name: string;
  batchCode: string;
  status: string;
  totalAmount: number;
  unit: string;
  periodStartedOn: string;
  periodEndedOn: string;
  lastHarvestedOn: string | null;
  harvestCount: number;
  totalHarvestedFrameCount: number;
  hasComposition: boolean;
};

export type HoneyBatchesResponse = {
  page: PagedResponse<HoneyBatchListItem>;
};

export type HoneyBatchDetails = {
  id: string;
  name: string;
  batchCode: string;
  status: string;
  totalAmount: number;
  unit: string;
  notes: string | null;
  periodStartedOn: string;
  periodEndedOn: string;
  harvestCount: number;
  totalHarvestedFrameCount: number;
  sourceSuperCount: number;
  harvests: Array<{
    id: string;
    harvestedOn: string;
    honeyAmount: number;
    unit: string;
    harvestedFrameCount: number;
    superCount: number;
  }>;
  sources: HarvestSource[];
  currentComposition: {
    id: string;
    algorithmVersion: string;
    determinedAt: string;
    determinationMethod: string;
    items: Array<{
      id: string;
      forageType: string;
      percentage: number;
      notes: string | null;
    }>;
  } | null;
  sourceIssues: HarvestSourceIssue[];
};

export type FinalizeHoneyBatchResponse = {
  id: string;
  status: string;
  batchCode: string;
  totalAmount: number;
  unit: string;
  periodStartedOn: string;
  periodEndedOn: string;
};
