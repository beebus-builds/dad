import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { Campaign, CampaignRecipient, CampaignSegment, CampaignStats } from "@/types";

export type CampaignListParams = {
  page?: number;
  pageSize?: number;
  status?: Campaign["status"];
};

export type CampaignPayload = {
  name: string;
  subject: string;
  body: string;
  segment: CampaignSegment;
};

export const campaignService = {
  async list(params: CampaignListParams = {}): Promise<Paginated<Campaign>> {
    const { data } = await api.get<Paginated<Campaign>>("/campaigns", { params });
    return data;
  },
  async detail(id: string): Promise<Campaign> {
    const { data } = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return data.data;
  },
  async create(payload: CampaignPayload): Promise<Campaign> {
    const { data } = await api.post<ApiResponse<Campaign>>("/campaigns", payload);
    return data.data;
  },
  async update(id: string, payload: CampaignPayload): Promise<Campaign> {
    const { data } = await api.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, payload);
    return data.data;
  },
  async previewAudience(segment: CampaignSegment): Promise<number> {
    const { data } = await api.post<ApiResponse<{ count: number }>>("/campaigns/preview-audience", { segment });
    return data.data.count;
  },
  async schedule(id: string, scheduledAt: string): Promise<Campaign> {
    const { data } = await api.post<ApiResponse<Campaign>>(`/campaigns/${id}/schedule`, { scheduledAt });
    return data.data;
  },
  async send(id: string): Promise<Campaign> {
    const { data } = await api.post<ApiResponse<Campaign>>(`/campaigns/${id}/send`);
    return data.data;
  },
  async cancel(id: string): Promise<Campaign> {
    const { data } = await api.post<ApiResponse<Campaign>>(`/campaigns/${id}/cancel`);
    return data.data;
  },
  async stats(id: string): Promise<CampaignStats> {
    const { data } = await api.get<ApiResponse<CampaignStats>>(`/campaigns/${id}/stats`);
    return data.data;
  },
  async recipients(id: string, params: { page?: number; pageSize?: number } = {}): Promise<Paginated<CampaignRecipient>> {
    const { data } = await api.get<Paginated<CampaignRecipient>>(`/campaigns/${id}/recipients`, { params });
    return data;
  },
};
