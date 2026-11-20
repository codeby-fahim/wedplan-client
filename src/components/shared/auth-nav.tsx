"use client";

import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, Settings2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/hooks/use-sign-out";
import { authClient } from "@/lib/auth-client";

function getInitials(name?: string | null) {
  if (!name?.trim()) return "WP";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function AuthNav() {
  const { data: session, isPending } = authClient.useSession();
  const signOut = useSignOut();

  if (isPending) {
    return (
      <div className="hidden items-center gap-3 md:flex" aria-hidden="true">
        <div className="h-9 w-20 animate-pulse rounded-full bg-[var(--surface-muted)]" />
        <div className="h-9 w-20 animate-pulse rounded-full bg-[var(--surface-muted)]" />
      </div>
    );
  }

  const user = session?.user;

  if (!user) {
    return (
      <div className="hidden items-center gap-3 md:flex">
        <Link
          href="/sign-in"
          className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--brand)] px-5 text-sm font-medium text-[var(--brand)] transition-all duration-200 hover:bg-[var(--brand-soft)]"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--brand)] px-5 text-sm font-medium text-[var(--brand-foreground)] shadow-sm transition-all duration-200 hover:bg-[var(--brand-hover)] hover:shadow-md"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-2 pl-1 text-sm transition-colors hover:bg-[var(--brand-soft)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/50 focus-visible:outline-none">
          <Avatar size="sm">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="max-w-28 truncate font-medium text-[var(--text-primary)]">
            {user.name ?? "Account"}
          </span>
          <ChevronDown
            size={14}
            className="shrink-0 text-[var(--text-secondary)]"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-[var(--text-primary)]">
              {user.name ?? "Account"}
            </span>
            <span className="muted-text truncate text-xs font-normal">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem render={<Link href="/dashboard" />}>
            <LayoutDashboard />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <Settings2 />
            Profile Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => void signOut()}
          >
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
