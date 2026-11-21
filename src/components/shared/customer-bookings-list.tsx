"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Inbox,
  MapPin,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getCustomerBookings,
  type BookingRecord,
  type BookingStatus,
} from "@/lib/api/booking-api";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<
  BookingStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "Pending",
    className: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
    icon: Clock3,
  },
  accepted: {
    label: "Accepted",
    className: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive text-destructive-foreground",
    icon: XCircle,
  },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CustomerBookingsList() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCustomerBookings();
      if (active) setBookings(data);
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Could not load your bookings.");
      }
    } finally {
      if (active) setLoading(false);
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

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="theme-card h-36 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
          <div>
            <p className="font-medium text-(--text-primary)">
              We couldn&apos;t load your bookings
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
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="theme-card flex flex-col items-center px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
          <Inbox size={26} />
        </span>
        <h2 className="mt-4 font-heading text-lg font-semibold text-(--text-primary)">
          No booking requests yet
        </h2>
        <p className="muted-text mt-1 max-w-sm text-sm">
          Browse wedding services and send a request to get started.
        </p>
        <Link
          href="/services"
          className={cn(buttonVariants(), "mt-5 rounded-full")}
        >
          Browse services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const style = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;
        const Icon = style.icon;

        return (
          <article key={booking.id} className="theme-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-base font-semibold text-(--text-primary)">
                  {booking.serviceName}
                </h3>
                <p className="muted-text text-xs">
                  Requested {formatDate(booking.createdAt)}
                </p>
              </div>
              <Badge className={style.className}>
                <Icon aria-hidden="true" />
                {style.label}
              </Badge>
            </div>

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 text-(--text-primary)">
                <CalendarDays size={15} className="text-(--brand)" />
                {formatDate(booking.eventDate)}
              </p>
              <p className="flex items-center gap-2 text-(--text-primary)">
                <MapPin size={15} className="text-(--brand)" />
                {booking.eventLocation}
              </p>
            </div>

            <div className="mt-3 rounded-lg bg-(--surface-muted) px-3 py-2.5">
              <p className="muted-text text-[11px] font-medium uppercase tracking-wide">
                Your message
              </p>
              <p className="mt-1 text-sm text-(--text-primary)">{booking.message}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
