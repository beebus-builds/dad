import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { News } from "@/types";

export type NewsListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: News["category"];
  status?: News["status"];
};

export const newsService = {
  async list(params: NewsListParams = {}): Promise<Paginated<News>> {
    const { data } = await api.get<Paginated<News>>("/news", { params });
    return data;
  },
  async detail(id: string): Promise<News> {
    const { data } = await api.get<ApiResponse<News>>(`/news/${id}`);
    return data.data;
  },
  async create(payload: Partial<News>): Promise<News> {
    const { data } = await api.post<ApiResponse<News>>("/news", payload);
    return data.data;
  },
  async update(id: string, payload: Partial<News> & { status?: News["status"] }): Promise<News> {
    const { data } = await api.patch<ApiResponse<News>>(`/news/${id}`, payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/news/${id}`);
  },
};
