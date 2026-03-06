import { api } from "./client";
import type {
  Tag,
  TagListResponse,
  TagCreateInput,
  TagPatchInput,
} from "@/lib/types";

export async function getTags(): Promise<TagListResponse> {
  return api.get<TagListResponse>("/tags");
}

export async function getTag(id: string): Promise<Tag> {
  return api.get<Tag>(`/tags/${id}`);
}

export async function createTag(data: TagCreateInput): Promise<Tag> {
  return api.post<Tag>("/tags", data);
}

export async function updateTag(id: string, data: TagPatchInput): Promise<Tag> {
  return api.patch<Tag>(`/tags/${id}`, data);
}

export async function deleteTag(id: string): Promise<void> {
  return api.del(`/tags/${id}`);
}
