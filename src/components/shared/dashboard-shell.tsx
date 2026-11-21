"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ClipboardList,
  Crown,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings2,
  ShieldCheck,
  Store,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DASHBOARD_LABELS, type DashboardRole } from "@/lib/dashboard-routes";
import { useSignOut } from "@/hooks/use-sign-out";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: LucideIcon };

type ShellUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const NAV: Record<DashboardRole, NavItem[]> = {
  vendor: [
    { label: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
    { label: "My Services", href: "/dashboard/vendor/services", icon: Store },
    { label: "Add Service", href: "/dashboard/vendor/services/new", icon: Plus },
    {
      label: "Booking Requests",
      href: "/dashboard/vendor/requests",
      icon: Inbox,
    },
    {
      label: "Subscription",
      href: "/dashboard/vendor/subscription",
      icon: Crown,
    },
    {
      label: "Profile Settings",
      href: "/dashboard/vendor/profile",
      icon: Settings2,
    },
  ],
  customer: [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    {
      label: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Profile Settings",
      href: "/dashboard/customer/profile",
      icon: Settings2,
    },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    {
      label: "Manage Services",
      href: "/dashboard/admin/services",
      icon: ClipboardList,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: Wallet,
    },
  ],
};

const ROLE_ICON: Record<DashboardRole, LucideIcon> = {
  vendor: Store,
  customer: CalendarCheck,
  admin: ShieldCheck,
};

function getInitials(name?: string | null) {
  if (!name?.trim()) return "WP";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function DashboardShell({
  role,
  user,
  children,
}: {
  role: DashboardRole;
  user: ShellUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = NAV[role];
  const RoleIcon = ROLE_ICON[role];

  const isActive = (href: string) =>
    href === `/dashboard/${role}`
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <Link
          href={`/dashboard/${role}`}
          className="flex items-center gap-2.5"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand)">
            <RoleIcon size={18} />
          </span>
          <span>
            <span className="block font-heading text-sm font-semibold text-(--text-primary)">
              {DASHBOARD_LABELS[role]}
            </span>
            <span className="muted-text block text-[11px]">WedPlan</span>
          </span>
        </Link>
      </div>

      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 p-3">
        {items.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-(--brand-soft) text-(--brand)"
                : "muted-text hover:bg-(--surface-muted) hover:text-(--text-primary)"
            )}
          >
            <Icon size={17} className="shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar size="sm">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-(--text-primary)">
              {user.name ?? "Account"}
            </p>
            <p className="muted-text truncate text-[11px]">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-(--page-background)">
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-(--surface) lg:block">
        {sidebar}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="absolute top-16 bottom-0 left-0 h-[calc(100dvh-4rem)] w-72 max-w-[85%] border-r border-border bg-(--surface) shadow-xl">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close dashboard menu"
              className="absolute top-4 right-3 z-10 flex size-8 items-center justify-center rounded-full text-(--text-secondary) hover:bg-(--surface-muted)"
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="static z-40 flex h-14 items-center gap-3 border-b border-border bg-(--surface)/90 px-4 backdrop-blur sm:sticky sm:top-16 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open dashboard menu"
            className="flex size-9 items-center justify-center rounded-lg border border-border text-(--text-primary) lg:hidden"
          >
            <Menu size={18} />
          </button>
          <h2 className="font-heading truncate text-base font-semibold text-(--text-primary)">
            {DASHBOARD_LABELS[role]}
          </h2>
          <span className="muted-text ml-auto hidden max-w-[45vw] truncate text-xs sm:block">
            {user.email}
          </span>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
