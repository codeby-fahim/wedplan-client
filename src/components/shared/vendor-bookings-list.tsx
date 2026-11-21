"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getVendorBookings,
  updateBookingStatus,
  type BookingRecord,
  type BookingStatus,
} from "@/lib/api/booking-api";

const STATUS_STYLE: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  },
  accepted: {
    label: "Accepted",
    className: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive text-destructive-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-secondary text-secondary-foreground",
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

function formatPrice(price: number) {
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(price)}`;
}

export default function VendorBookingsList() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getVendorBookings();
      if (active) setBookings(data);
    } catch (err) {
      if (active) {
        setError(
          err instanceof Error ? err.message : "Could not load booking requests."
        );
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

  const process = async (booking: BookingRecord, status: "accepted" | "rejected") => {
    setBusyId(booking.id);

    try {
      const updated = await updateBookingStatus(booking.id, status);
      setBookings((current) =>
        status === "rejected"
          ? current.filter((item) => item.id !== updated.id)
          : current.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success(`Booking ${status}`, {
        description: `${booking.customerName} · ${booking.serviceName}`,
      });
    } catch (err) {
      toast.error("Could not update request", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="theme-card h-40 animate-pulse" />
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
              We couldn&apos;t load booking requests
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
          When couples request your services, their messages will appear here.
        </p>
      </div>
    );
  }

  const pending = bookings.filter((booking) => booking.status === "pending").length;

  return (
    <div className="space-y-5">
      <p className="muted-text text-sm">
        {bookings.length} active request{bookings.length === 1 ? "" : "s"} · {pending} pending
      </p>

      <div className="space-y-4">
        {bookings.map((booking) => {
          const style = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;
          const isPending = booking.status === "pending";
          const isBusy = busyId === booking.id;

          return (
            <article key={booking.id} className="theme-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-semibold text-(--text-primary)">
                    {booking.serviceName}
                  </h3>
                  <p className="muted-text text-xs">
                    {formatPrice(booking.price)} · Booking #{booking.id.slice(-6)}
                  </p>
                </div>
                <Badge className={style.className}>{style.label}</Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-(--text-primary)">
                    <UserRound size={15} className="text-(--brand)" />
                    {booking.customerName}
                  </p>
                  <p className="muted-text flex min-w-0 items-center gap-2 break-all text-xs">
                    <Mail size={14} className="shrink-0" /> {booking.customerEmail}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-(--text-primary)">
                    <CalendarDays size={15} className="text-(--brand)" />
                    {formatDate(booking.eventDate)}
                  </p>
                  <p className="muted-text flex items-center gap-2 text-xs">
                    <MapPin size={14} /> {booking.eventLocation}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-(--surface-muted) px-3 py-2.5">
                <p className="muted-text text-[11px] font-medium uppercase tracking-wide">
                  Customer message
                </p>
                <p className="mt-1 break-words text-sm text-(--text-primary)">
                  {booking.message}
                </p>
              </div>

              {isPending ? (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    disabled={isBusy}
                    onClick={() => void process(booking, "accepted")}
                    className="rounded-full"
                  >
                    {isBusy ? <Loader2 className="animate-spin" /> : <Check />}
                    {isBusy ? "Processing..." : "Accept"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => void process(booking, "rejected")}
                    className="rounded-full"
                  >
                    {isBusy ? <Loader2 className="animate-spin" /> : <X />}
                    {isBusy ? "Processing..." : "Reject"}
                  </Button>
                </div>
              ) : (
                <p className="muted-text mt-4 text-xs">
                  This request has already been {booking.status} and can no longer
                  be changed.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
