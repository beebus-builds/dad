import { api } from "@/lib/api-client";
import type { Page } from "@/types";

export const pageService = {
  list: async (): Promise<{ data: Page[] }> => {
    return api.get("/pages");
  },
  create: async (item: Partial<Page>): Promise<Page> => {
    return api.post("/pages", item);
  },
  update: async (id: string, item: Partial<Page>): Promise<Page> => {
    return api.patch(`/pages/${id}`, item);
  },
  remove: async (id: string): Promise<void> => {
    return api.delete(`/pages/${id}`);
  },
  getBySlug: async (slug: string): Promise<Page> => {
    return api.get(`/public/pages/${slug}`);
  },
};
