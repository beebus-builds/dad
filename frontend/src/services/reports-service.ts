import { api, type ApiResponse } from "@/lib/api-client";
import type { BranchBreakdown, DashboardStats } from "@/types";

export const reportsService = {
  async dashboard(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>("/reports/dashboard");
    return data.data;
  },
  async branchBreakdown(): Promise<BranchBreakdown[]> {
    const { data } = await api.get<ApiResponse<BranchBreakdown[]>>("/reports/branches");
    return data.data;
  },
};
