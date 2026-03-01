"use client";

import { Search } from "lucide-react";
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
}

export function SearchControls({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: SearchControlsProps) {
  return (
    <div className="flex items-center gap-2 px-3 pb-2 pt-4">
      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-shrink-0 gap-1 text-xs text-muted-foreground"
          >
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
              <DropdownMenuRadioItem
                key={option}
                value={option}
                className="text-sm"
              >
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
          placeholder="Search clips, games, creators..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9"
        />
      </div>
    </div>
  );
}
