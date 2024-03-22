"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block text-primary font-bold">
              {siteConfig.emoji}{" "}
              <span className="hidden md:inline-block">{siteConfig.name}</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-8">
          <Link href="/dashboard">
            <Button size="sm">Open Dashboard</Button>
          </Link>
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="hidden md:block text-sm font-medium text-muted-foreground"
          >
            GitHub
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
