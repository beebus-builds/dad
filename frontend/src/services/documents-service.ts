import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { DocumentItem } from "@/types";

export type DocumentListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: DocumentItem["category"];
  visibility?: DocumentItem["visibility"];
};

export const documentService = {
  async list(params: DocumentListParams = {}): Promise<Paginated<DocumentItem>> {
    const { data } = await api.get<Paginated<DocumentItem>>("/documents", { params });
    return data;
  },
  async create(payload: { title: string; description?: string; category: DocumentItem["category"]; visibility: DocumentItem["visibility"]; fileUrl: string; fileType: string; fileSize: number }): Promise<DocumentItem> {
    const { data } = await api.post<ApiResponse<DocumentItem>>("/documents", payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};
