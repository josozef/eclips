import { Clip, ClipTag, ConnectedAccount } from "@/types";

interface ClipRow {
  id: number;
  user_id: string;
  title: string;
  game: string;
  game_color: string;
  thumbnail_url: string;
  duration: number;
  created_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  streamer: string;
  tags: string[];
}

function mapClipRow(row: ClipRow): Clip {
  return {
    id: String(row.id),
    title: row.title,
    game: row.game as Clip["game"],
    thumbnailUrl: row.thumbnail_url,
    duration: row.duration,
    createdAt: row.created_at,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    streamer: row.streamer,
    tags: row.tags as ClipTag[],
  };
}

export async function fetchClips(): Promise<Clip[]> {
  const res = await fetch("/api/clips");
  if (!res.ok) {
    console.error("Error fetching clips:", res.statusText);
    return [];
  }

  const rows: ClipRow[] = await res.json();
  return rows.map(mapClipRow);
}

export async function syncUser(): Promise<void> {
  await fetch("/api/user/sync", { method: "POST" });
}

export async function fetchConnectedAccounts(): Promise<ConnectedAccount[]> {
  const res = await fetch("/api/accounts");
  if (!res.ok) return [];
  return res.json();
}

export async function disconnectAccount(provider: string): Promise<boolean> {
  const res = await fetch("/api/accounts", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider }),
  });
  return res.ok;
}
