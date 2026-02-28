"use client";

import { Search, SlidersHorizontal, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SortOption, SORT_LABELS } from "@/types";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  filtersVisible: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
}

export function Header({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filtersVisible,
  onToggleFilters,
  activeFilterCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-extrabold tracking-wide">
          E<span className="text-primary">Clips</span>
        </h1>

        <div className="flex items-center gap-1">
          {/* Filter toggle */}
          <Button
            variant={filtersVisible || activeFilterCount > 0 ? "secondary" : "ghost"}
            size="icon"
            className="relative h-8 w-8"
            onClick={onToggleFilters}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
                {SORT_LABELS[sortBy]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(v) => onSortChange(v as SortOption)}
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                  <DropdownMenuRadioItem key={option} value={option} className="text-sm">
                    {SORT_LABELS[option]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeSwitcher />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clips, games, streamers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>
    </header>
  );
}
