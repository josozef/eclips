"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { fetchClips, syncUser } from "@/lib/queries";
import { Clip, ClipTag, GameName, SortOption, SORT_LABELS } from "@/types";
import { ClipCard } from "@/components/clip-card";
import { FilterBar } from "@/components/filter-bar";
import { Header } from "@/components/header";
import { SearchControls } from "@/components/search-controls";
import { Landing } from "@/components/landing";
import { Button } from "@/components/ui/button";

function ClipsDashboard() {
  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectedGames, setSelectedGames] = useState<GameName[]>([]);
  const [selectedTags, setSelectedTags] = useState<ClipTag[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    syncUser().then(() =>
      fetchClips().then((clips) => {
        setAllClips(clips);
        setLoading(false);
      })
    );
  }, []);

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
    let result = [...allClips];

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
  }, [allClips, searchQuery, sortBy, selectedGames, selectedTags]);

  const activeFilterCount = selectedGames.length + selectedTags.length;

  return (
    <div className="mx-auto max-w-3xl">
      <SearchControls
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
          {loading ? (
            "Loading..."
          ) : (
            <>
              {clips.length} clip{clips.length !== 1 ? "s" : ""} &middot;{" "}
              {SORT_LABELS[sortBy]}
            </>
          )}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
            <p className="mt-4 text-sm">Loading clips...</p>
          </div>
        ) : clips.length > 0 ? (
          clips.map((clip) => <ClipCard key={clip.id} clip={clip} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">No clips found</p>
            <p className="text-sm">Try adjusting your filters or search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <SignedOut>
        <Landing />
      </SignedOut>

      <SignedIn>
        <ClipsDashboard />
      </SignedIn>
    </div>
  );
}
