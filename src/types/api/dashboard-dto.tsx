export type DashboardStatsDto = {
  imageProps: CategoryStats;
  videosProps: CategoryStats;
  docsProps: CategoryStats;
  othersProps: CategoryStats;
  adminProps: AdminStats;
};
// types/api/dashboard-dto.ts
export type CategoryStats = {
  count: number;
  occupiedSize: number;
  formattedOccupiedSize: string;
  totalSize: number;
  formattedTotalSize: string;
  occupiedPercentage: number;
};
export type AdminStats = {
  totalFilesCreated: number;
  totalNumberOfUsers: number;
  totalMemoryAllocated: number;
  remainingMemory: number;
  memoryConsumedPercentage: number;
  remainingMemoryPercentage: number;
  storageRequestPending: number;
  storageRequestApproved: number;
};