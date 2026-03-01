import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProvider, getCallbackUrl } from "@/lib/providers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
}

async function fetchTwitchUser(
  accessToken: string,
  clientId: string,
): Promise<TwitchUser> {
  const res = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
    },
  });
  const json = await res.json();
  return json.data[0];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params;
  const provider = getProvider(providerId);

  if (!provider) {
    return NextResponse.redirect(new URL("/?error=unknown_provider", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL(`/?error=oauth_denied&provider=${providerId}`, req.url),
    );
  }

  const userId = state.split(":").slice(1).join(":");
  if (!userId) {
    return NextResponse.redirect(new URL("/?error=invalid_state", req.url));
  }

  const clientId = process.env[provider.clientIdEnv]!;
  const clientSecret = process.env[provider.clientSecretEnv]!;
  const redirectUri = getCallbackUrl(providerId);

  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody.toString(),
  });

  if (!tokenRes.ok) {
    console.error("Token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(
      new URL(`/?error=token_exchange&provider=${providerId}`, req.url),
    );
  }

  const tokens = await tokenRes.json();

  let providerAccountId = "";
  let providerUsername = "";

  if (providerId === "twitch") {
    const user = await fetchTwitchUser(tokens.access_token, clientId);
    providerAccountId = user.id;
    providerUsername = user.display_name || user.login;
  }

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const { error: dbError } = await supabase.from("connected_accounts").upsert(
    {
      user_id: userId,
      provider: providerId,
      provider_account_id: providerAccountId,
      provider_username: providerUsername,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      token_expires_at: expiresAt,
      scopes: provider.scopes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
  );

  if (dbError) {
    console.error("Error saving connected account:", dbError.message);
    return NextResponse.redirect(
      new URL(`/?error=save_failed&provider=${providerId}`, req.url),
    );
  }

  return NextResponse.redirect(new URL("/?connected=" + providerId, req.url));
}
