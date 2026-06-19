import { api, type ApiResponse } from "@/lib/api-client";
import type { News, Member } from "@/types";

type SearchResult = {
  type: "news" | "event" | "document";
  id: string;
  title: string;
  excerpt: string;
  slug?: string;
  createdAt: string;
};

export const publicService = {
  async newsDetail(slug: string): Promise<News> {
    const { data } = await api.get<ApiResponse<News>>(`/public/news/${slug}`);
    return data.data;
  },
  async newsList(): Promise<News[]> {
    const { data } = await api.get<ApiResponse<News[]>>("/public/news");
    return data.data;
  },
  async registerForEvent(eventId: string, payload: { fullName: string; email?: string; phone?: string }): Promise<void> {
    await api.post(`/public/events/${eventId}/register`, payload);
  },
  async memberApply(payload: {
    fullName: string;
    email?: string;
    phone: string;
    address?: string;
    occupation?: string;
    employer?: string;
  }): Promise<void> {
    await api.post("/public/members/apply", payload);
  },
  async donate(payload: { donorName: string; donorEmail?: string; donorPhone?: string; amount: number; method: string; purpose?: string }): Promise<void> {
    await api.post("/public/donations", payload);
  },
  async contactSubmit(payload: { name: string; email: string; phone?: string; subject: string; message: string }): Promise<void> {
    await api.post("/public/contact", payload);
  },
  async search(q: string): Promise<SearchResult[]> {
    const { data } = await api.get<SearchResult[]>("/public/search", { params: { q } });
    return data;
  },
  async getMemberProfile(id: string): Promise<Member> {
    const { data } = await api.get<ApiResponse<Member>>(`/public/members/${id}`);
    return data.data;
  },
};
