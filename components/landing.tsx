"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Gamepad2, Share2, Film, Users, Zap, Trophy } from "lucide-react";

export function Landing() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-57px)] max-w-5xl gap-8 px-4 py-12 md:grid-cols-2 md:gap-12">
      {/* Left column — intro content */}
      <div className="flex flex-col justify-center">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Share Your Best{" "}
          <span className="text-primary">Gaming Moments</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          EClips makes it easy to upload, organize, and share your gaming clips
          across platforms like Instagram, TikTok, YouTube, and more.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <Feature icon={<Film className="h-5 w-5" />} title="Import Clips">
            Pull clips from Twitch, YouTube, Kick, or your console.
          </Feature>
          <Feature icon={<Gamepad2 className="h-5 w-5" />} title="Organize by Game">
            Sort and tag clips by game, moment type, and mood.
          </Feature>
          <Feature icon={<Share2 className="h-5 w-5" />} title="Share Everywhere">
            One-click sharing to all your favorite social platforms.
          </Feature>
          <Feature icon={<Users className="h-5 w-5" />} title="Build Your Page">
            Create a personal clip page others can follow and share.
          </Feature>
          <Feature icon={<Zap className="h-5 w-5" />} title="Tag Moments">
            Mark clips as Intense, Funny, Warlord, GGs, and more.
          </Feature>
          <Feature icon={<Trophy className="h-5 w-5" />} title="Rise to the Top">
            See what&rsquo;s trending — most viewed, liked, and commented.
          </Feature>
        </div>
      </div>

      {/* Right column — sign in + ad space */}
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="w-full max-w-sm">
          <SignIn
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-xl",
              },
            }}
            routing="hash"
          />
        </div>

        {/* Ad placeholder */}
        <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Ad Space
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/60">
            300 &times; 250
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border/50 bg-card/50 p-3">
      <div className="mt-0.5 flex-shrink-0 text-primary">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          {children}
        </p>
      </div>
    </div>
  );
}
