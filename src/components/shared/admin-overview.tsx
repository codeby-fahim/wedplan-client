"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats, type AdminStats } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";

type Stat = { label: string; value: number; icon: LucideIcon; hint: string };

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setError(null);

    try {
      const data = await getAdminStats();
      if (active) setStats(data);
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Could not load dashboard.");
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      void load(active);
    });

    return () => {
      active = false;
    };
  }, [load, requestId]);

  if (error) {
    return (
      <Card className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
          <div>
            <p className="font-medium text-(--text-primary)">
              We couldn&apos;t load the dashboard
            </p>
            <p className="muted-text text-sm">{error}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRequestId((current) => current + 1)}
          className="rounded-full"
        >
          <RefreshCw /> Retry
        </Button>
      </Card>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="theme-card h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards: Stat[] = [
    {
      label: "Total Registered Users",
      value: stats.totalUsers,
      icon: Users,
      hint: "Everyone on the platform",
    },
    {
      label: "Total Vendors",
      value: stats.totalVendors,
      icon: Store,
      hint: "Service providers",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      icon: ShieldCheck,
      hint: "Couples planning events",
    },
    {
      label: "Total Services",
      value: stats.totalServices,
      icon: ClipboardList,
      hint: "All submitted services",
    },
    {
      label: "Pending Services",
      value: stats.pendingServices,
      icon: CheckCircle2,
      hint: "Awaiting your review",
    },
    {
      label: "Total Transactions",
      value: stats.totalTransactions,
      icon: CreditCard,
      hint: "Completed payments",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="theme-card p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand)">
              <Icon size={19} />
            </span>
            <p className="mt-4 text-2xl font-semibold text-(--text-primary)">{value}</p>
            <p className="mt-1 text-sm font-medium text-(--text-primary)">{label}</p>
            <p className="muted-text mt-1 text-xs">{hint}</p>
          </div>
        ))}
      </div>

      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-(--text-primary)">
            Quick actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/admin/users"
            className={cn(buttonVariants(), "rounded-full")}
          >
            <Users /> Manage Users
          </Link>
          <Link
            href="/dashboard/admin/services"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            <ClipboardList /> Manage Services
          </Link>
          <Link
            href="/dashboard/admin/transactions"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            <CreditCard /> Transactions
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
