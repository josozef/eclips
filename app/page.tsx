"use client";

import { useState, useMemo, useCallback } from "react";
import { dummyClips } from "@/data/dummy-clips";
import { ClipTag, GameName, SortOption, SORT_LABELS } from "@/types";
import { ClipCard } from "@/components/clip-card";
import { FilterBar } from "@/components/filter-bar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectedGames, setSelectedGames] = useState<GameName[]>([]);
  const [selectedTags, setSelectedTags] = useState<ClipTag[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const toggleGame = useCallback((game: GameName) => {
    setSelectedGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    );
  }, []);

  const toggleTag = useCallback((tag: ClipTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clips = useMemo(() => {
    let result = [...dummyClips];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.game.toLowerCase().includes(q) ||
          c.streamer.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedGames.length > 0) {
      result = result.filter((c) => selectedGames.includes(c.game));
    }

    if (selectedTags.length > 0) {
      result = result.filter((c) =>
        selectedTags.some((tag) => c.tags.includes(tag))
      );
    }

    switch (sortBy) {
      case "recent":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "popular":
        result.sort((a, b) => b.views - a.views);
        break;
      case "liked":
        result.sort((a, b) => b.likes - a.likes);
        break;
      case "commented":
        result.sort((a, b) => b.comments - a.comments);
        break;
    }

    return result;
  }, [searchQuery, sortBy, selectedGames, selectedTags]);

  const activeFilterCount = selectedGames.length + selectedTags.length;

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filtersVisible={filtersVisible}
        onToggleFilters={() => setFiltersVisible((v) => !v)}
        activeFilterCount={activeFilterCount}
      />

      {filtersVisible && (
        <FilterBar
          selectedGames={selectedGames}
          selectedTags={selectedTags}
          onToggleGame={toggleGame}
          onToggleTag={toggleTag}
        />
      )}

      {/* Results bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {clips.length} clip{clips.length !== 1 ? "s" : ""} &middot;{" "}
          {SORT_LABELS[sortBy]}
        </span>
        {activeFilterCount > 0 && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-primary"
            onClick={() => {
              setSelectedGames([]);
              setSelectedTags([]);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Clip list */}
      <div className="flex flex-col gap-2 px-3 pb-8">
        {clips.length > 0 ? (
          clips.map((clip) => <ClipCard key={clip.id} clip={clip} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">No clips found</p>
            <p className="text-sm">Try changing your filters or search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
