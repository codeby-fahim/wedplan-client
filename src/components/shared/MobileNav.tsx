"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, Settings2, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSignOut } from "@/hooks/use-sign-out";
import { authClient } from "@/lib/auth-client";

export type NavLink = {
  label: string;
  href: string;
};

type MobileNavProps = {
  links: NavLink[];
};

function getInitials(name?: string | null) {
  if (!name?.trim()) return "WP";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = authClient.useSession();
  const signOut = useSignOut();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const user = session?.user;

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute right-0 top-12 w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-2xl border border-border bg-(--surface) p-2 shadow-xl"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--brand-soft) hover:text-(--brand)"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-2 h-px bg-border" />

          {isPending ? (
            <div className="space-y-2 p-1" aria-hidden="true">
              <div className="h-9 animate-pulse rounded-lg bg-(--surface-muted)" />
              <div className="h-9 animate-pulse rounded-lg bg-(--surface-muted)" />
            </div>
          ) : !user ? (
            <div className="flex flex-col gap-2 p-1">
              <Link
                href="/sign-in"
                onClick={closeMenu}
                className="inline-flex h-10 items-center justify-center rounded-full border border-(--brand) px-5 text-sm font-medium text-(--brand) transition-colors hover:bg-(--brand-soft)"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMenu}
                className="inline-flex h-10 items-center justify-center rounded-full bg-(--brand) px-5 text-sm font-medium text-(--brand-foreground) shadow-sm transition-colors hover:bg-(--brand-hover)"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 px-3 py-2">
                <Avatar size="sm">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user.name ?? "User"}
                  />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-(--text-primary)">
                    {user.name ?? "Account"}
                  </p>
                  <p className="muted-text truncate text-xs">{user.email}</p>
                </div>
              </div>

              <div className="my-2 h-px bg-border" />

              <ul className="flex flex-col">
                <li>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--brand-soft) hover:text-(--brand)"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--brand-soft) hover:text-(--brand)"
                  >
                    <Settings2 size={16} />
                    Profile Settings
                  </Link>
                </li>
              </ul>

              <div className="my-2 h-px bg-border" />

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  void signOut();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
