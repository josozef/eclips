export type SortOption = "recent" | "popular" | "featured";

export type SocialProvider = "twitch" | "youtube" | "tiktok" | "instagram";

export type ShareDestination = "youtube" | "tiktok" | "instagram";

export interface ShareStatus {
  shared_at: string;
  destination_url: string | null;
}

export interface Clip {
  id: string;
  user_id: string;
  source_provider: string;
  source_id: string;
  url: string | null;
  embed_url: string | null;
  title: string;
  broadcaster_id: string | null;
  broadcaster_name: string | null;
  creator_id: string | null;
  creator_name: string | null;
  game_id: string | null;
  game_name: string | null;
  language: string | null;
  thumbnail_url: string | null;
  duration: number;
  view_count: number;
  vod_offset: number | null;
  is_featured: boolean;
  clip_created_at: string;
  synced_at: string;
  updated_at: string;
  shares: Record<string, ShareStatus>;
}

export interface ConnectedAccount {
  id: string;
  provider: SocialProvider;
  provider_account_id: string;
  provider_username: string | null;
  scopes: string[];
  connected_at: string;
  updated_at: string;
}

export const SORT_LABELS: Record<SortOption, string> = {
  recent: "Most Recent",
  popular: "Most Viewed",
  featured: "Featured",
};

export const DESTINATION_PROVIDERS: ShareDestination[] = [
  "youtube",
  "tiktok",
  "instagram",
];
