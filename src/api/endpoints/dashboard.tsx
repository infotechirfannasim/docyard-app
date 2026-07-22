import { DashboardStatsDto } from "@/types/api/dashboard-dto";
import { apiClient } from "../client";

export async function fetchDashboardStats(userId: number): Promise<DashboardStatsDto> {
  const { data } = await apiClient.get(`/dl/dashboard/${userId}`);
  return data["data"]; // unwrap the envelope, return just the actual stats
}