import { fetchDashboardStats } from "@/api/endpoints/dashboard";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats(userId: number){
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => fetchDashboardStats(userId),
    enabled: !!userId, // only fetch if userId is provided
  });
}