import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { User } from "@/types";

export type UserListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: User["role"];
  branchId?: string;
};

export const userService = {
  async list(params: UserListParams = {}): Promise<Paginated<User>> {
    const { data } = await api.get<Paginated<User>>("/users", { params });
    return data;
  },
  async detail(id: string): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },
  async update(id: string, payload: Partial<User>): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>(`/users/${id}`, payload);
    return data.data;
  },
  async deactivate(id: string): Promise<void> {
    await api.post(`/users/${id}/deactivate`);
  },
};
