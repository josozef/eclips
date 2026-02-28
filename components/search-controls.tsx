"use client";

import { Search, SlidersHorizontal } from "lucide-react";
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
import { SortOption, SORT_LABELS } from "@/types";

interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  filtersVisible: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
}

export function SearchControls({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filtersVisible,
  onToggleFilters,
  activeFilterCount,
}: SearchControlsProps) {
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-2">
      {/* Filter toggle */}
      <Button
        variant={filtersVisible || activeFilterCount > 0 ? "secondary" : "outline"}
        size="icon"
        className="relative h-9 w-9 flex-shrink-0"
        onClick={onToggleFilters}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1 text-xs text-muted-foreground flex-shrink-0">
            {SORT_LABELS[sortBy]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
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

      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clips, games, streamers..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
    </div>
  );
}
