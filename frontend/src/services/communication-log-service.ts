import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { CommunicationChannel, CommunicationLog } from "@/types";

export type CreateCommunicationLogInput = {
  channel: CommunicationChannel;
  subject: string;
  notes: string;
};

export const communicationLogService = {
  async list(memberId: string, params: { page?: number; pageSize?: number } = {}): Promise<Paginated<CommunicationLog>> {
    const { data } = await api.get<Paginated<CommunicationLog>>(`/members/${memberId}/communication-logs`, { params });
    return data;
  },
  async create(memberId: string, payload: CreateCommunicationLogInput): Promise<CommunicationLog> {
    const { data } = await api.post<ApiResponse<CommunicationLog>>(`/members/${memberId}/communication-logs`, payload);
    return data.data;
  },
};
