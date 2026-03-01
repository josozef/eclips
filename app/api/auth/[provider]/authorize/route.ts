import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getProvider, getCallbackUrl } from "@/lib/providers";
import crypto from "crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider: providerId } = await params;
  const provider = getProvider(providerId);
  if (!provider) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  const clientId = process.env[provider.clientIdEnv];
  if (!clientId) {
    return NextResponse.json(
      { error: `${provider.name} is not configured` },
      { status: 500 },
    );
  }

  const state = crypto.randomBytes(32).toString("hex");
  const redirectUri = getCallbackUrl(providerId);

  const url = new URL(provider.authUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", provider.scopes.join(" "));
  url.searchParams.set("state", `${state}:${userId}`);

  if (providerId === "twitch") {
    url.searchParams.set("force_verify", "true");
  }

  return NextResponse.redirect(url.toString());
}
