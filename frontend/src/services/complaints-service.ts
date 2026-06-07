import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { Complaint } from "@/types";

export type ComplaintListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: Complaint["status"];
  priority?: Complaint["priority"];
  branchId?: string;
};

export const complaintService = {
  async list(params: ComplaintListParams = {}): Promise<Paginated<Complaint>> {
    const { data } = await api.get<Paginated<Complaint>>("/complaints", { params });
    return data;
  },
  async detail(id: string): Promise<Complaint> {
    const { data } = await api.get<ApiResponse<Complaint>>(`/complaints/${id}`);
    return data.data;
  },
  async create(payload: Partial<Complaint>): Promise<Complaint> {
    const { data } = await api.post<ApiResponse<Complaint>>("/complaints", payload);
    return data.data;
  },
  async update(id: string, payload: Partial<Complaint>): Promise<Complaint> {
    const { data } = await api.patch<ApiResponse<Complaint>>(`/complaints/${id}`, payload);
    return data.data;
  },
  async stats(): Promise<Record<string, number>> {
    const { data } = await api.get<ApiResponse<Record<string, number>>>("/complaints/stats");
    return data.data;
  },
};
