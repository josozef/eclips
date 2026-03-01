"use client";

import Image from "next/image";
import {
  Eye,
  ExternalLink,
  Twitch,
  Youtube,
  Instagram,
  Music,
  Star,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clip, DESTINATION_PROVIDERS, ShareDestination } from "@/types";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

const SOURCE_ICONS: Record<string, typeof Twitch> = {
  twitch: Twitch,
  youtube: Youtube,
};

const SOURCE_COLORS: Record<string, string> = {
  twitch: "#9146FF",
  youtube: "#FF0000",
};

const DEST_META: Record<
  ShareDestination,
  { icon: typeof Youtube; color: string; label: string }
> = {
  youtube: { icon: Youtube, color: "#FF0000", label: "YouTube" },
  tiktok: { icon: Music, color: "#69C9D0", label: "TikTok" },
  instagram: { icon: Instagram, color: "#E1306C", label: "Instagram" },
};

export function ClipCard({ clip }: { clip: Clip }) {
  const SourceIcon = SOURCE_ICONS[clip.source_provider] ?? Twitch;
  const sourceColor = SOURCE_COLORS[clip.source_provider] ?? "#666";

  return (
    <Card className="group flex overflow-hidden border-border/50 transition-colors hover:border-border">
      {/* Thumbnail */}
      <div className="relative h-[100px] w-[160px] flex-shrink-0">
        {clip.thumbnail_url ? (
          <Image
            src={clip.thumbnail_url}
            alt={clip.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <SourceIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {formatDuration(clip.duration)}
        </span>
        {clip.is_featured && (
          <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-amber-500/90 px-1 py-0.5 text-[9px] font-bold text-black">
            <Star className="h-2.5 w-2.5" />
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        {/* Top row: source + game + time */}
        <div className="flex items-center gap-2">
          <SourceIcon
            className="h-3.5 w-3.5 flex-shrink-0"
            style={{ color: sourceColor }}
          />
          {clip.game_name && (
            <Badge
              variant="secondary"
              className="border-0 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wide"
            >
              {clip.game_name}
            </Badge>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap">
            {timeAgo(clip.clip_created_at)}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-1.5">
          <p className="line-clamp-1 text-sm font-semibold leading-tight">
            {clip.title}
          </p>
          {clip.url && (
            <a
              href={clip.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Creator / broadcaster */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {clip.creator_name && (
            <span>
              Clipped by{" "}
              <span className="font-medium text-foreground/80">
                {clip.creator_name}
              </span>
            </span>
          )}
          {clip.broadcaster_name && clip.creator_name !== clip.broadcaster_name && (
            <>
              <span className="text-border">|</span>
              <span>{clip.broadcaster_name}</span>
            </>
          )}
        </div>

        {/* Bottom: views + share indicators */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            {formatCount(clip.view_count)}
          </span>

          <div className="flex-1" />

          {/* Sharing destination indicators */}
          <div className="flex items-center gap-1.5">
            {DESTINATION_PROVIDERS.map((dest) => {
              const meta = DEST_META[dest];
              const shared = clip.shares[dest];
              const Icon = meta.icon;

              return (
                <div
                  key={dest}
                  className="relative flex items-center"
                  title={
                    shared
                      ? `Shared to ${meta.label}`
                      : `Not shared to ${meta.label}`
                  }
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{
                      color: shared ? meta.color : undefined,
                      opacity: shared ? 1 : 0.25,
                    }}
                  />
                  {shared ? (
                    <CheckCircle2
                      className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-background text-emerald-500"
                    />
                  ) : (
                    <Circle
                      className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-background text-muted-foreground/30"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
