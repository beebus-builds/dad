import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { Branch } from "@/types";

export const branchService = {
  async list(): Promise<Branch[]> {
    const { data } = await api.get<ApiResponse<Branch[]>>("/branches");
    return data.data;
  },
  async listAdmin(params: { page?: number; pageSize?: number; search?: string } = {}): Promise<Paginated<Branch>> {
    const { data } = await api.get<Paginated<Branch>>("/branches/admin", { params });
    return data;
  },
  async detail(id: string): Promise<Branch> {
    const { data } = await api.get<ApiResponse<Branch>>(`/branches/${id}`);
    return data.data;
  },
  async create(payload: Partial<Branch>): Promise<Branch> {
    const { data } = await api.post<ApiResponse<Branch>>("/branches", payload);
    return data.data;
  },
  async update(id: string, payload: Partial<Branch>): Promise<Branch> {
    const { data } = await api.patch<ApiResponse<Branch>>(`/branches/${id}`, payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/branches/${id}`);
  },
};
