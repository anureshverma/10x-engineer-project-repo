/**
 * TypeScript interfaces matching backend Pydantic models (PromptLab API).
 */

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  collection_id?: string;
  tag_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface PromptListResponse {
  prompts: Prompt[];
  total: number;
}

export interface PromptCreateInput {
  title: string;
  content: string;
  description?: string;
  collection_id?: string;
  tag_ids?: string[];
}

export type PromptUpdateInput = PromptCreateInput;

export interface PromptPatchInput {
  title?: string;
  content?: string;
  description?: string;
  collection_id?: string;
  tag_ids?: string[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface CollectionListResponse {
  collections: Collection[];
  total: number;
}

export interface CollectionCreateInput {
  name: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  created_at?: string;
}

export interface TagListResponse {
  tags: Tag[];
  total: number;
}

export interface TagCreateInput {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}

export interface TagPatchInput {
  name?: string;
  description?: string;
  color?: string;
}

export interface AssignTagsRequest {
  tag_ids: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
}
