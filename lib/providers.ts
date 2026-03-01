export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
}

export const PROVIDERS: Record<string, OAuthProvider> = {
  twitch: {
    id: "twitch",
    name: "Twitch",
    icon: "twitch",
    color: "#9146FF",
    authUrl: "https://id.twitch.tv/oauth2/authorize",
    tokenUrl: "https://id.twitch.tv/oauth2/token",
    scopes: ["user:read:email", "clips:edit"],
    clientIdEnv: "TWITCH_CLIENT_ID",
    clientSecretEnv: "TWITCH_CLIENT_SECRET",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "youtube",
    color: "#FF0000",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.upload",
    ],
    clientIdEnv: "YOUTUBE_CLIENT_ID",
    clientSecretEnv: "YOUTUBE_CLIENT_SECRET",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "music",
    color: "#000000",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic", "video.list", "video.upload"],
    clientIdEnv: "TIKTOK_CLIENT_ID",
    clientSecretEnv: "TIKTOK_CLIENT_SECRET",
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: "instagram",
    color: "#E1306C",
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scopes: ["user_profile", "user_media"],
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
  },
};

export function getProvider(id: string): OAuthProvider | undefined {
  return PROVIDERS[id];
}

export function getCallbackUrl(provider: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base}/api/auth/${provider}/callback`;
}
