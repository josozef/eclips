"use client";

import { Button } from "@/components/ui/button";
import { ClipTag, GameName, ALL_TAGS, ALL_GAMES, TAG_COLORS, GAME_COLORS } from "@/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  selectedGames: GameName[];
  selectedTags: ClipTag[];
  onToggleGame: (game: GameName) => void;
  onToggleTag: (tag: ClipTag) => void;
}

export function FilterBar({
  selectedGames,
  selectedTags,
  onToggleGame,
  onToggleTag,
}: FilterBarProps) {
  return (
    <div className="space-y-3 border-b border-border px-4 pb-3">
      {/* Game filters */}
      <div className="flex flex-wrap gap-2">
        {ALL_GAMES.map((game) => {
          const active = selectedGames.includes(game);
          const color = GAME_COLORS[game] ?? "#888";
          return (
            <Button
              key={game}
              variant="outline"
              size="sm"
              onClick={() => onToggleGame(game)}
              className={cn(
                "h-7 rounded-full px-3 text-xs font-medium transition-all",
                active && "border-transparent",
              )}
              style={
                active
                  ? { backgroundColor: color + "30", color, borderColor: color }
                  : undefined
              }
            >
              {game}
            </Button>
          );
        })}
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map((tag) => {
          const active = selectedTags.includes(tag);
          const color = TAG_COLORS[tag] ?? "#888";
          return (
            <Button
              key={tag}
              variant="outline"
              size="sm"
              onClick={() => onToggleTag(tag)}
              className={cn(
                "h-7 rounded-full px-3 text-xs font-medium transition-all",
                active && "border-transparent",
              )}
              style={
                active
                  ? { backgroundColor: color + "25", color, borderColor: color }
                  : undefined
              }
            >
              {tag}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
