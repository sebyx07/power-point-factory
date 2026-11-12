/** Subset of https://api.kubeez.com/openapi.json we use. Full reference: docs/kubeez.md */
export type GenerationType = "text-to-image" | "image-to-image" | "text-to-video" | "image-to-video";

export interface MediaGenerateRequest {
  prompt: string;
  model: string;
  generation_type?: GenerationType;
  negative_prompt?: string;
  source_media_urls?: string[];
  aspect_ratio?: string;
  resolution?: string;
  quality?: string;
  seed?: number;
  duration?: string;
  sound?: boolean;
}

export interface GenerationAccepted {
  generation_id: string;
  status?: string | null;
  model?: string | null;
  estimated_cost_credits?: number | null;
  aspect_ratio_adjusted?: string | null;
  message?: string | null;
}

export interface MediaOutputItem {
  id?: string;
  url?: string | null;
  optimized_url?: string | null;
  thumbnail_url?: string | null;
  media_type?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  optimization_status?: string | null;
}

export interface GenerationStatus {
  id: string;
  status?: "pending" | "processing" | "completed" | "failed" | string | null;
  cdn_ready?: boolean | null;
  model?: string | null;
  error_message?: string | null;
  credits_deducted?: number | null;
  outputs?: MediaOutputItem[];
}

export interface MusicGenerateRequest {
  prompt: string;
  instrumental?: boolean;
  model?: string;
  negative_tags?: string;
}
export interface MusicSong {
  audio_url?: string | null;
  stream_url?: string | null;
  cover_image_url?: string | null;
  duration_seconds?: number | null;
  title?: string | null;
}
export interface MusicGenerationStatus {
  status?: string | null;
  error_message?: string | null;
  songs?: MusicSong[];
}

export interface ModelInfo {
  model_id: string;
  [k: string]: unknown;
}
export interface ModelsListResponse {
  models: ModelInfo[];
  total_count: number;
}
export interface BalanceResponse {
  credits?: number;
  message?: string;
  purchase_url?: string;
  team?: unknown;
}
export interface UploadResponse {
  success?: boolean;
  urls?: string[];
  message?: string;
}
