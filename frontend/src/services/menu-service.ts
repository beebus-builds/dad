import { api } from "@/lib/api-client";
import type { MenuItem } from "@/types";

export const menuService = {
  list: async (): Promise<{ data: MenuItem[] }> => {
    return api.get("/public/menu");
  },
  adminList: async (): Promise<{ data: MenuItem[] }> => {
    return api.get("/menus");
  },
  create: async (item: Partial<MenuItem>): Promise<MenuItem> => {
    return api.post("/menus", item);
  },
  update: async (id: string, item: Partial<MenuItem>): Promise<MenuItem> => {
    return api.patch(`/menus/${id}`, item);
  },
  remove: async (id: string): Promise<void> => {
    return api.delete(`/menus/${id}`);
  },
};
