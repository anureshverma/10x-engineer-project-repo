import { api } from "./client";
import type {
  Collection,
  CollectionListResponse,
  CollectionCreateInput,
} from "@/lib/types";

export async function getCollections(): Promise<CollectionListResponse> {
  return api.get<CollectionListResponse>("/collections");
}

export async function getCollection(id: string): Promise<Collection> {
  return api.get<Collection>(`/collections/${id}`);
}

export async function createCollection(
  data: CollectionCreateInput
): Promise<Collection> {
  return api.post<Collection>("/collections", data);
}

export async function deleteCollection(id: string): Promise<void> {
  return api.del(`/collections/${id}`);
}
