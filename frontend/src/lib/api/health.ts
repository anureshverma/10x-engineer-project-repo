import { api } from "./client";
import type { HealthResponse } from "@/lib/types";

export async function getHealth(): Promise<HealthResponse> {
  return api.get<HealthResponse>("/health");
}
