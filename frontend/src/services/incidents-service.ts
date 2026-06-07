import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { WorkerIncident } from "@/types";

export type IncidentListParams = {
  page?: number;
  pageSize?: number;
  severity?: WorkerIncident["severity"];
  status?: WorkerIncident["status"];
};

export const incidentService = {
  async list(params: IncidentListParams = {}): Promise<Paginated<WorkerIncident>> {
    const { data } = await api.get<Paginated<WorkerIncident>>("/incidents", { params });
    return data;
  },
  async create(payload: Partial<WorkerIncident>): Promise<WorkerIncident> {
    const { data } = await api.post<ApiResponse<WorkerIncident>>("/incidents", payload);
    return data.data;
  },
};
