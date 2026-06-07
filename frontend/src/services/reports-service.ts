import { api, type ApiResponse } from "@/lib/api-client";
import type { DashboardStats } from "@/types";

export const reportsService = {
  async dashboard(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>("/reports/dashboard");
    return data.data;
  },
};
