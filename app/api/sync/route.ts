import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { syncTwitchClips } from "@/lib/sync/twitch";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("id, provider, provider_username, last_sync_at")
    .eq("user_id", userId)
    .in("provider", ["twitch", "youtube"]);

  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ synced: [] });
  }

  const results = [];

  for (const account of accounts) {
    try {
      let result;
      if (account.provider === "twitch") {
        result = await syncTwitchClips(userId, account.id);
      } else {
        result = { added: 0, updated: 0, removed: 0 };
      }

      results.push({
        provider: account.provider,
        username: account.provider_username,
        ...result,
      });
    } catch (err) {
      console.error(`Sync failed for ${account.provider}:`, err);
      results.push({
        provider: account.provider,
        username: account.provider_username,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ synced: results });
}
