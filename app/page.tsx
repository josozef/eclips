"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { fetchClips, syncUser, syncClips } from "@/lib/queries";
import { Clip, SortOption, SORT_LABELS } from "@/types";
import { ClipCard } from "@/components/clip-card";
import { Header, AppView } from "@/components/header";
import { SearchControls } from "@/components/search-controls";
import { Landing } from "@/components/landing";
import { ConnectedAccounts } from "@/components/connected-accounts";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw } from "lucide-react";

function ClipsView() {
  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const loadClips = useCallback(async () => {
    const clips = await fetchClips();
    setAllClips(clips);
    setLoading(false);
  }, []);

  useEffect(() => {
    syncUser()
      .then(() => syncClips())
      .then(() => loadClips());
  }, [loadClips]);

  const handleResync = async () => {
    setSyncing(true);
    await syncClips();
    await loadClips();
    setSyncing(false);
  };

  const clips = useMemo(() => {
    let result = [...allClips];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.game_name?.toLowerCase().includes(q) ?? false) ||
          (c.broadcaster_name?.toLowerCase().includes(q) ?? false) ||
          (c.creator_name?.toLowerCase().includes(q) ?? false),
      );
    }

    switch (sortBy) {
      case "recent":
        result.sort(
          (a, b) =>
            new Date(b.clip_created_at).getTime() -
            new Date(a.clip_created_at).getTime(),
        );
        break;
      case "popular":
        result.sort((a, b) => b.view_count - a.view_count);
        break;
      case "featured":
        result.sort(
          (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0),
        );
        break;
    }

    return result;
  }, [allClips, searchQuery, sortBy]);

  return (
    <div className="mx-auto max-w-3xl">
      <SearchControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Results bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {loading ? (
            "Syncing clips..."
          ) : (
            <>
              {clips.length} clip{clips.length !== 1 ? "s" : ""} &middot;{" "}
              {SORT_LABELS[sortBy]}
            </>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground"
          onClick={handleResync}
          disabled={syncing || loading}
        >
          <RefreshCw
            className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? "Syncing..." : "Sync"}
        </Button>
      </div>

      {/* Clip list */}
      <div className="flex flex-col gap-2 px-3 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
            <p className="mt-4 text-sm">Syncing clips from your sources...</p>
          </div>
        ) : clips.length > 0 ? (
          clips.map((clip) => <ClipCard key={clip.id} clip={clip} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">No clips found</p>
            <p className="text-sm">
              Connect a source in Accounts to start importing clips.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          Analytics coming soon
        </p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Track views, engagement, and growth across your clips.
        </p>
      </div>
    </div>
  );
}

function AccountsView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="mb-1 text-lg font-semibold">Accounts</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage your clip sources and sharing destinations.
      </p>
      <ConnectedAccounts />
    </div>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<AppView>("clips");

  return (
    <div className="min-h-screen">
      <Header activeView={activeView} onChangeView={setActiveView} />

      <SignedOut>
        <Landing />
      </SignedOut>

      <SignedIn>
        {activeView === "clips" && <ClipsView />}
        {activeView === "analytics" && <AnalyticsView />}
        {activeView === "accounts" && <AccountsView />}
      </SignedIn>
    </div>
  );
}
