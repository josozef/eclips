import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

interface TwitchClip {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
  vod_offset: number | null;
  is_featured: boolean;
}

interface TwitchTokenRefresh {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<TwitchTokenRefresh | null> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) return null;
  return res.json();
}

async function fetchGameNames(
  gameIds: string[],
  accessToken: string,
  clientId: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (gameIds.length === 0) return map;

  const unique = [...new Set(gameIds.filter(Boolean))];
  const batches: string[][] = [];
  for (let i = 0; i < unique.length; i += 100) {
    batches.push(unique.slice(i, i + 100));
  }

  for (const batch of batches) {
    const params = batch.map((id) => `id=${id}`).join("&");
    const res = await fetch(`https://api.twitch.tv/helix/games?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
    });
    if (res.ok) {
      const json = await res.json();
      for (const game of json.data) {
        map.set(game.id, game.name);
      }
    }
  }

  return map;
}

async function fetchAllClips(
  broadcasterId: string,
  accessToken: string,
  clientId: string,
  startedAt: string,
): Promise<TwitchClip[]> {
  const all: TwitchClip[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      first: "100",
      started_at: startedAt,
    });
    if (cursor) params.set("after", cursor);

    const res = await fetch(
      `https://api.twitch.tv/helix/clips?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": clientId,
        },
      },
    );

    if (!res.ok) {
      console.error("Twitch clips fetch failed:", res.status, await res.text());
      break;
    }

    const json = await res.json();
    all.push(...json.data);
    cursor = json.pagination?.cursor;
  } while (cursor);

  return all;
}

export async function syncTwitchClips(
  userId: string,
  accountId: string,
): Promise<{ added: number; updated: number; removed: number }> {
  const { data: account } = await supabase
    .from("connected_accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (!account) throw new Error("Account not found");

  await supabase
    .from("connected_accounts")
    .update({ sync_status: "syncing" })
    .eq("id", accountId);

  let accessToken = account.access_token;
  const clientId = process.env.TWITCH_CLIENT_ID!;

  const tokenExpired =
    account.token_expires_at &&
    new Date(account.token_expires_at) < new Date();

  if (tokenExpired && account.refresh_token) {
    const refreshed = await refreshAccessToken(account.refresh_token);
    if (refreshed) {
      accessToken = refreshed.access_token;
      await supabase
        .from("connected_accounts")
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          token_expires_at: new Date(
            Date.now() + refreshed.expires_in * 1000,
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", accountId);
    } else {
      await supabase
        .from("connected_accounts")
        .update({ sync_status: "error" })
        .eq("id", accountId);
      throw new Error("Failed to refresh Twitch token");
    }
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const startedAt = oneYearAgo.toISOString();

  const remoteClips = await fetchAllClips(
    account.provider_account_id,
    accessToken,
    clientId,
    startedAt,
  );

  const gameIds = remoteClips.map((c) => c.game_id);
  const gameNameMap = await fetchGameNames(gameIds, accessToken, clientId);

  const { data: existingClips } = await supabase
    .from("clips")
    .select("id, source_id, view_count, title, thumbnail_url, is_featured")
    .eq("user_id", userId)
    .eq("source_provider", "twitch");

  const existingMap = new Map(
    (existingClips ?? []).map((c) => [c.source_id, c]),
  );
  const remoteIds = new Set(remoteClips.map((c) => c.id));

  let added = 0;
  let updated = 0;

  const toInsert: object[] = [];
  const toUpdate: { dbId: string; data: object }[] = [];

  for (const clip of remoteClips) {
    const existing = existingMap.get(clip.id);

    const row = {
      user_id: userId,
      source_provider: "twitch",
      source_id: clip.id,
      url: clip.url,
      embed_url: clip.embed_url,
      title: clip.title,
      broadcaster_id: clip.broadcaster_id,
      broadcaster_name: clip.broadcaster_name,
      creator_id: clip.creator_id,
      creator_name: clip.creator_name,
      game_id: clip.game_id,
      game_name: gameNameMap.get(clip.game_id) ?? null,
      language: clip.language,
      thumbnail_url: clip.thumbnail_url,
      duration: clip.duration,
      view_count: clip.view_count,
      vod_offset: clip.vod_offset,
      is_featured: clip.is_featured,
      clip_created_at: clip.created_at,
      updated_at: new Date().toISOString(),
    };

    if (!existing) {
      toInsert.push(row);
      added++;
    } else {
      const changed =
        existing.view_count !== clip.view_count ||
        existing.title !== clip.title ||
        existing.thumbnail_url !== clip.thumbnail_url ||
        existing.is_featured !== clip.is_featured;

      if (changed) {
        toUpdate.push({ dbId: existing.id, data: row });
        updated++;
      }
    }
  }

  if (toInsert.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      await supabase.from("clips").insert(toInsert.slice(i, i + batchSize));
    }
  }

  for (const { dbId, data } of toUpdate) {
    await supabase.from("clips").update(data).eq("id", dbId);
  }

  const toRemoveIds = (existingClips ?? [])
    .filter((c) => !remoteIds.has(c.source_id))
    .map((c) => c.id);

  let removed = 0;
  if (toRemoveIds.length > 0) {
    await supabase.from("clips").delete().in("id", toRemoveIds);
    removed = toRemoveIds.length;
  }

  await supabase
    .from("connected_accounts")
    .update({
      last_sync_at: new Date().toISOString(),
      sync_status: "idle",
    })
    .eq("id", accountId);

  return { added, updated, removed };
}
