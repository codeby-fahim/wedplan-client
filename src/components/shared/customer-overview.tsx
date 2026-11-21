"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ListChecks,
  RefreshCw,
  Search,
  Settings2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCustomerStats,
  type CustomerStats,
} from "@/lib/api/booking-api";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: number;
  icon: LucideIcon;
  hint: string;
};

export default function CustomerOverview() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setError(null);

    try {
      const data = await getCustomerStats();
      if (active) setStats(data);
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Could not load your dashboard.");
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
              We couldn&apos;t load your dashboard
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="theme-card h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards: Stat[] = [
    {
      label: "Total Booking Requests",
      value: stats.total,
      icon: ListChecks,
      hint: "All requests you have sent",
    },
    {
      label: "Pending Bookings",
      value: stats.pending,
      icon: Clock3,
      hint: "Awaiting a vendor response",
    },
    {
      label: "Accepted Bookings",
      value: stats.accepted,
      icon: CheckCircle2,
      hint: "Confirmed by vendors",
    },
    {
      label: "Rejected Bookings",
      value: stats.rejected,
      icon: XCircle,
      hint: "Not accepted by vendors",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <CardDescription>
            Discover services and keep track of your booking requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/services" className={cn(buttonVariants(), "rounded-full")}>
            <Search /> Browse Services
          </Link>
          <Link
            href="/dashboard/customer/bookings"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            <CalendarCheck /> My Bookings
          </Link>
          <Link
            href="/dashboard/customer/profile"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            <Settings2 /> Profile Settings
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
