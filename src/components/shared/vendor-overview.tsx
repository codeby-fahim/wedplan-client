"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Crown,
  Plus,
  RefreshCw,
  Store,
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
import { getVendorStats, type VendorStats } from "@/lib/api/service-api";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  hint: string;
};

export default function VendorOverview() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setError(null);

    try {
      const data = await getVendorStats();
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

  const statsCards: Stat[] = [
    {
      label: "Total Services",
      value: stats.totalServices,
      icon: Store,
      href: "/dashboard/vendor/services",
      hint: "All services you have submitted",
    },
    {
      label: "Active Services",
      value: stats.activeServices,
      icon: CheckCircle2,
      href: "/dashboard/vendor/services",
      hint:
        stats.activeServiceLimit === null
          ? "Approved and visible to customers"
          : `${stats.activeServiceLimit - stats.activeServices} free-plan slot${stats.activeServiceLimit - stats.activeServices === 1 ? "" : "s"} left`,
    },
    {
      label: "Pending Requests",
      value: stats.pendingBookings,
      icon: Clock3,
      href: "/dashboard/vendor/requests",
      hint: "Booking requests awaiting your reply",
    },
    {
      label: "Accepted Bookings",
      value: stats.acceptedBookings,
      icon: CalendarCheck,
      href: "/dashboard/vendor/requests",
      hint: "Confirmed bookings",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map(({ label, value, icon: Icon, href, hint }) => (
          <Link
            key={label}
            href={href}
            className="theme-card group p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand)">
                <Icon size={19} />
              </span>
              <ArrowRight
                size={16}
                className="muted-text transition-transform group-hover:translate-x-1"
              />
            </div>
            <p className="mt-4 text-2xl font-semibold text-(--text-primary)">{value}</p>
            <p className="mt-1 text-sm font-medium text-(--text-primary)">{label}</p>
            <p className="muted-text mt-1 text-xs">{hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="theme-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-(--text-primary)">
              Quick actions
            </CardTitle>
            <CardDescription>
              Keep your offerings fresh and respond to couples quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/vendor/services/new"
              className={cn(buttonVariants(), "rounded-full")}
            >
              <Plus /> Add Service
            </Link>
            <Link
              href="/dashboard/vendor/services"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
            >
              <Store /> My Services
            </Link>
            <Link
              href="/dashboard/vendor/requests"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
            >
              <CalendarCheck /> Booking Requests
            </Link>
          </CardContent>
        </Card>

        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-(--text-primary)">
              Subscription
            </CardTitle>
            <CardDescription>Your current WedPlan plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="text-(--brand)" size={20} />
              <span className="text-lg font-semibold capitalize text-(--text-primary)">
                {stats.subscriptionPlan}
              </span>
            </div>
            <p className="muted-text text-sm">
              {stats.subscriptionPlan === "premium"
                ? "Unlimited active services and promotional benefits."
                : `Up to ${stats.activeServiceLimit} active services. Upgrade to Premium for unlimited listings.`}
            </p>
            <Link
              href="/dashboard/vendor/subscription"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
            >
              View plans
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
