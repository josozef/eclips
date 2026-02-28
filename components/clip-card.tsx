"use client";

import Image from "next/image";
import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clip, TAG_COLORS, GAME_COLORS } from "@/types";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
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
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}

export function ClipCard({ clip }: { clip: Clip }) {
  const gameColor = GAME_COLORS[clip.game] ?? "#666";

  const handleShare = async () => {
    const text = `Check out this clip: ${clip.title} — ${clip.game}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: clip.title, text, url: window.location.href });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="group flex overflow-hidden border-border/50 hover:border-border transition-colors">
      {/* Thumbnail */}
      <div className="relative h-[100px] w-[160px] flex-shrink-0">
        <Image
          src={clip.thumbnailUrl}
          alt={clip.title}
          fill
          sizes="160px"
          className="object-cover"
        />
        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {formatDuration(clip.duration)}
        </span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        {/* Top: game badge + timestamp */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="text-[10px] font-bold uppercase tracking-wide border-0 px-1.5 py-0"
            style={{ backgroundColor: gameColor + "25", color: gameColor }}
          >
            {clip.game}
          </Badge>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {timeAgo(clip.createdAt)}
          </span>
        </div>

        {/* Title */}
        <p className="line-clamp-1 text-sm font-semibold leading-tight">
          {clip.title}
        </p>

        {/* Streamer + tags */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xs font-medium text-primary flex-shrink-0">
            {clip.streamer}
          </span>
          <div className="flex gap-1 overflow-hidden">
            {clip.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full px-1.5 py-0 text-[10px] font-medium border-0"
                style={{
                  backgroundColor: (TAG_COLORS[tag] ?? "#666") + "20",
                  color: TAG_COLORS[tag] ?? "#ccc",
                }}
              >
                {tag}
              </Badge>
            ))}
            {clip.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{clip.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            {formatCount(clip.views)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-pink-500">
            <Heart className="h-3 w-3" />
            {formatCount(clip.likes)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-teal-400">
            <MessageCircle className="h-3 w-3" />
            {formatCount(clip.comments)}
          </span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-primary"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
