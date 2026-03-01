"use client";

import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AppView = "clips" | "analytics" | "accounts";

interface HeaderProps {
  activeView?: AppView;
  onChangeView?: (view: AppView) => void;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: "clips", label: "Clips" },
  { id: "analytics", label: "Analytics" },
];

export function Header({ activeView = "clips", onChangeView }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: logo + primary nav */}
        <div className="flex items-center gap-8">
          <Image
            src="/logo.png"
            alt="EClips"
            width={240}
            height={48}
            priority
            className="h-10 w-auto cursor-pointer"
            onClick={() => onChangeView?.("clips")}
          />

          <SignedIn>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeView?.(item.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </SignedIn>
        </div>

        {/* Right: accounts + auth */}
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="h-9 text-sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="default" size="sm" className="h-9 text-sm">
                Sign up
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button
              variant={activeView === "accounts" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => onChangeView?.("accounts")}
              title="Accounts"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
