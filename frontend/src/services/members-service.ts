import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { Member } from "@/types";

export type MemberListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  branchId?: string;
  status?: Member["status"];
  tier?: Member["tier"];
};

export const memberService = {
  async list(params: MemberListParams = {}): Promise<Paginated<Member>> {
    const { data } = await api.get<Paginated<Member>>("/members", { params });
    return data;
  },
  async detail(id: string): Promise<Member> {
    const { data } = await api.get<ApiResponse<Member>>(`/members/${id}`);
    return data.data;
  },
  async create(payload: Partial<Member>): Promise<Member> {
    const { data } = await api.post<ApiResponse<Member>>("/members", payload);
    return data.data;
  },
  async update(id: string, payload: Partial<Member>): Promise<Member> {
    const { data } = await api.patch<ApiResponse<Member>>(`/members/${id}`, payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/members/${id}`);
  },
};
