import { api, type ApiResponse } from "@/lib/api-client";
import type { Notification } from "@/types";

export const notificationService = {
  async list(): Promise<Notification[]> {
    const { data } = await api.get<ApiResponse<Notification[]>>("/notifications");
    return data.data;
  },
  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
  async markAllRead(): Promise<void> {
    await api.post("/notifications/read-all");
  },
};
