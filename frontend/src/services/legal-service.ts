import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { LegalCase } from "@/types";

export type LegalListParams = {
  page?: number;
  pageSize?: number;
  type?: LegalCase["type"];
  status?: LegalCase["status"];
};

export const legalService = {
  async list(params: LegalListParams = {}): Promise<Paginated<LegalCase>> {
    const { data } = await api.get<Paginated<LegalCase>>("/legal-cases", { params });
    return data;
  },
  async detail(id: string): Promise<LegalCase> {
    const { data } = await api.get<ApiResponse<LegalCase>>(`/legal-cases/${id}`);
    return data.data;
  },
  async create(payload: Partial<LegalCase>): Promise<LegalCase> {
    const { data } = await api.post<ApiResponse<LegalCase>>("/legal-cases", payload);
    return data.data;
  },
  async update(id: string, payload: { status?: LegalCase["status"]; assignedAdvisor?: string }): Promise<LegalCase> {
    const { data } = await api.patch<ApiResponse<LegalCase>>(`/legal-cases/${id}`, payload);
    return data.data;
  },
};
