import { api } from "./client";
import type {
  Prompt,
  PromptListResponse,
  PromptCreateInput,
  PromptUpdateInput,
  PromptPatchInput,
  TagListResponse,
  AssignTagsRequest,
} from "@/lib/types";

export interface GetPromptsFilters {
  collection_id?: string;
  search?: string;
  tag_ids?: string[];
  tag_match?: "any" | "all";
}

export async function getPrompts(
  filters?: GetPromptsFilters
): Promise<PromptListResponse> {
  const params = new URLSearchParams();
  if (filters?.collection_id) params.set("collection_id", filters.collection_id);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.tag_ids?.length)
    params.set("tag_ids", filters.tag_ids.join(","));
  if (filters?.tag_match) params.set("tag_match", filters.tag_match);
  const qs = params.toString();
  const path = qs ? `/prompts?${qs}` : "/prompts";
  return api.get<PromptListResponse>(path);
}

export async function getPrompt(id: string): Promise<Prompt> {
  return api.get<Prompt>(`/prompts/${id}`);
}

export async function createPrompt(data: PromptCreateInput): Promise<Prompt> {
  return api.post<Prompt>("/prompts", data);
}

export async function updatePrompt(
  id: string,
  data: PromptUpdateInput
): Promise<Prompt> {
  return api.put<Prompt>(`/prompts/${id}`, data);
}

export async function patchPrompt(
  id: string,
  data: PromptPatchInput
): Promise<Prompt> {
  return api.patch<Prompt>(`/prompts/${id}`, data);
}

export async function deletePrompt(id: string): Promise<void> {
  return api.del(`/prompts/${id}`);
}

export async function getPromptTags(promptId: string): Promise<TagListResponse> {
  return api.get<TagListResponse>(`/prompts/${promptId}/tags`);
}

export async function setPromptTags(
  promptId: string,
  body: AssignTagsRequest
): Promise<{ tag_ids: string[] }> {
  return api.put<{ tag_ids: string[] }>(`/prompts/${promptId}/tags`, body);
}

export async function addPromptTags(
  promptId: string,
  body: AssignTagsRequest
): Promise<{ tag_ids: string[] }> {
  return api.post<{ tag_ids: string[] }>(`/prompts/${promptId}/tags`, body);
}

export async function removePromptTag(
  promptId: string,
  tagId: string
): Promise<void> {
  return api.del(`/prompts/${promptId}/tags/${tagId}`);
}
