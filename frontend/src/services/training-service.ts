import { api, type ApiResponse, type Paginated } from "@/lib/api-client";
import type { TrainingProgram } from "@/types";

export type TrainingListParams = {
  page?: number;
  pageSize?: number;
  status?: TrainingProgram["status"];
};

export const trainingService = {
  async list(params: TrainingListParams = {}): Promise<Paginated<TrainingProgram>> {
    const { data } = await api.get<Paginated<TrainingProgram>>("/training", { params });
    return data;
  },
  async create(payload: Partial<TrainingProgram>): Promise<TrainingProgram> {
    const { data } = await api.post<ApiResponse<TrainingProgram>>("/training", payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/training/${id}`);
  },
};
