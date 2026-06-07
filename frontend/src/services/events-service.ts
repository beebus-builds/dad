import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { Event } from "@/types";

export type EventListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: Event["status"];
  category?: Event["category"];
  upcoming?: boolean;
};

export const eventService = {
  async list(params: EventListParams = {}): Promise<Paginated<Event>> {
    const { data } = await api.get<Paginated<Event>>("/events", { params });
    return data;
  },
  async detail(id: string): Promise<Event> {
    const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`);
    return data.data;
  },
  async create(payload: Partial<Event>): Promise<Event> {
    const { data } = await api.post<ApiResponse<Event>>("/events", payload);
    return data.data;
  },
  async update(id: string, payload: Partial<Event> & { status?: Event["status"] }): Promise<Event> {
    const { data } = await api.patch<ApiResponse<Event>>(`/events/${id}`, payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};
