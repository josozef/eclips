export type ClipTag =
  | "Dying"
  | "Apeing"
  | "Warlord"
  | "Win"
  | "GGs"
  | "Intense"
  | "Calm"
  | "Funny";

export type GameName =
  | "Arc Raiders"
  | "PUBG"
  | "Fortnite"
  | "Apex Legends"
  | "League of Legends"
  | "Valorant"
  | "Overwatch"
  | "CS:GO";

export type SortOption = "recent" | "popular" | "liked" | "commented";

export interface Clip {
  id: string;
  title: string;
  game: GameName;
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
  tags: ClipTag[];
  views: number;
  likes: number;
  comments: number;
  shares: number;
  streamer: string;
}

export const SORT_LABELS: Record<SortOption, string> = {
  recent: "Most Recent",
  popular: "Most Viewed",
  liked: "Most Liked",
  commented: "Most Commented",
};

export const ALL_TAGS: ClipTag[] = [
  "Dying", "Apeing", "Warlord", "Win", "GGs", "Intense", "Calm", "Funny",
];

export const ALL_GAMES: GameName[] = [
  "Arc Raiders", "PUBG", "Fortnite", "Apex Legends",
  "League of Legends", "Valorant", "Overwatch", "CS:GO",
];

export const GAME_COLORS: Record<string, string> = {
  "Arc Raiders": "#E67E22",
  PUBG: "#F39C12",
  Fortnite: "#3498DB",
  "Apex Legends": "#E74C3C",
  "League of Legends": "#9B59B6",
  Valorant: "#E91E63",
  Overwatch: "#F57C00",
  "CS:GO": "#2ECC71",
};

export const TAG_COLORS: Record<string, string> = {
  Dying: "#E74C3C",
  Apeing: "#E67E22",
  Warlord: "#9B59B6",
  Win: "#2ECC71",
  GGs: "#3498DB",
  Intense: "#E91E63",
  Calm: "#00BCD4",
  Funny: "#FFEB3B",
};

export type SocialProvider = "twitch" | "youtube" | "tiktok" | "instagram";

export interface ConnectedAccount {
  id: string;
  provider: SocialProvider;
  provider_account_id: string;
  provider_username: string | null;
  scopes: string[];
  connected_at: string;
  updated_at: string;
}
