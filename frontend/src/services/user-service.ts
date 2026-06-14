import { api, type ApiResponse, type Paginated } from "@/lib/api-client";

export type UserItem = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  branchId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type UserListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  branchId?: string;
};

export const userService = {
  async list(params: UserListParams = {}): Promise<Paginated<UserItem>> {
    const { data } = await api.get<Paginated<UserItem>>("/users", { params });
    return data;
  },
  async get(id: string): Promise<UserItem> {
    const { data } = await api.get<ApiResponse<UserItem>>(`/users/${id}`);
    return data.data;
  },
  async create(payload: { fullName: string; email: string; phone?: string; password: string; role: string; branchId?: string }): Promise<UserItem> {
    const { data } = await api.post<ApiResponse<UserItem>>("/users", payload);
    return data.data;
  },
  async update(id: string, payload: { fullName?: string; phone?: string; role?: string; branchId?: string; isActive?: boolean }): Promise<UserItem> {
    const { data } = await api.patch<ApiResponse<UserItem>>(`/users/${id}`, payload);
    return data.data;
  },
  async deactivate(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
