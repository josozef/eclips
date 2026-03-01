"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Twitch,
  Youtube,
  Instagram,
  Music,
  Loader2,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchConnectedAccounts, disconnectAccount } from "@/lib/queries";
import { ConnectedAccount, SocialProvider } from "@/types";

const PROVIDER_META: Record<
  SocialProvider,
  { name: string; icon: typeof Twitch; color: string }
> = {
  twitch: { name: "Twitch", icon: Twitch, color: "#9146FF" },
  youtube: { name: "YouTube", icon: Youtube, color: "#FF0000" },
  tiktok: { name: "TikTok", icon: Music, color: "#69C9D0" },
  instagram: { name: "Instagram", icon: Instagram, color: "#E1306C" },
};

const SOURCE_PROVIDERS: SocialProvider[] = ["twitch", "youtube"];
const DESTINATION_PROVIDERS: SocialProvider[] = [
  "youtube",
  "tiktok",
  "instagram",
];

function ProviderRow({
  providerId,
  account,
  disconnecting,
  onConnect,
  onDisconnect,
}: {
  providerId: SocialProvider;
  account: ConnectedAccount | undefined;
  disconnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const meta = PROVIDER_META[providerId];
  const Icon = meta.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${meta.color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: meta.color }} />
        </div>
        <div>
          <p className="text-sm font-medium">{meta.name}</p>
          {account ? (
            <p className="text-xs text-muted-foreground">
              {account.provider_username || account.provider_account_id}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50">Not connected</p>
          )}
        </div>
      </div>

      {account ? (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDisconnect}
          disabled={disconnecting}
        >
          {disconnecting ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : null}
          Disconnect
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={onConnect}
        >
          Connect
        </Button>
      )}
    </div>
  );
}

export function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetchConnectedAccounts();
    setAccounts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleConnect = (provider: SocialProvider) => {
    window.location.href = `/api/auth/${provider}/authorize`;
  };

  const handleDisconnect = async (provider: SocialProvider) => {
    setDisconnecting(provider);
    const ok = await disconnectAccount(provider);
    if (ok) {
      setAccounts((prev) => prev.filter((a) => a.provider !== provider));
    }
    setDisconnecting(null);
  };

  const connectedMap = new Map(accounts.map((a) => [a.provider, a]));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sources */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Clip Sources
          </h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Connect platforms to import your gaming clips from.
        </p>

        <div className="mt-4 space-y-3">
          {SOURCE_PROVIDERS.map((id) => (
            <ProviderRow
              key={`source-${id}`}
              providerId={id}
              account={connectedMap.get(id)}
              disconnecting={disconnecting === id}
              onConnect={() => handleConnect(id)}
              onDisconnect={() => handleDisconnect(id)}
            />
          ))}
        </div>
      </div>

      {/* Destinations */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sharing Destinations
          </h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Connect platforms to share and publish your clips to.
        </p>

        <div className="mt-4 space-y-3">
          {DESTINATION_PROVIDERS.map((id) => (
            <ProviderRow
              key={`dest-${id}`}
              providerId={id}
              account={connectedMap.get(id)}
              disconnecting={disconnecting === id}
              onConnect={() => handleConnect(id)}
              onDisconnect={() => handleDisconnect(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
