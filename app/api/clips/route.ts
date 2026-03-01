import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: clips, error } = await supabase
    .from("clips")
    .select("*")
    .eq("user_id", userId)
    .order("clip_created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clips:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const clipIds = (clips ?? []).map((c) => c.id);

  let shares: { clip_id: string; destination: string; shared_at: string; destination_url: string | null }[] = [];
  if (clipIds.length > 0) {
    const { data } = await supabase
      .from("clip_shares")
      .select("clip_id, destination, shared_at, destination_url")
      .in("clip_id", clipIds);
    shares = data ?? [];
  }

  const sharesByClip = new Map<string, Record<string, { shared_at: string; destination_url: string | null }>>();
  for (const s of shares) {
    if (!sharesByClip.has(s.clip_id)) sharesByClip.set(s.clip_id, {});
    sharesByClip.get(s.clip_id)![s.destination] = {
      shared_at: s.shared_at,
      destination_url: s.destination_url,
    };
  }

  const enriched = (clips ?? []).map((clip) => ({
    ...clip,
    shares: sharesByClip.get(clip.id) ?? {},
  }));

  return NextResponse.json(enriched);
}
