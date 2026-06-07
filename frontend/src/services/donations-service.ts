import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { Donation } from "@/types";

export type DonationListParams = {
  page?: number;
  pageSize?: number;
  status?: Donation["status"];
  method?: Donation["method"];
};

export const donationService = {
  async list(params: DonationListParams = {}): Promise<Paginated<Donation>> {
    const { data } = await api.get<Paginated<Donation>>("/payments", { params });
    return data;
  },
  async create(payload: Partial<Donation>): Promise<Donation> {
    const { data } = await api.post<ApiResponse<Donation>>("/payments", payload);
    return data.data;
  },
  async total(): Promise<number> {
    const { data } = await api.get<ApiResponse<{ total: number }>>("/payments/total");
    return data.data.total;
  },
};
