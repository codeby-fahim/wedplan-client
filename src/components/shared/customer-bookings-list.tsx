"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Inbox,
  Loader2,
  MapPin,
  RefreshCw,
  Store,
  XCircle,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  cancelBooking,
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
  cancelled: {
    label: "Cancelled",
    className: "bg-secondary text-secondary-foreground",
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

function formatPrice(price: number) {
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(price)}`;
}

export default function CustomerBookingsList() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<BookingRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
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

  const confirmCancel = async () => {
    if (!pendingCancel) return;

    const target = pendingCancel;
    setBusyId(target.id);
    setPendingCancel(null);

    try {
      await cancelBooking(target.id);
      setBookings((current) => current.filter((item) => item.id !== target.id));
      toast.success("Booking request cancelled and removed", {
        description: target.serviceName,
      });
    } catch (err) {
      toast.error("Could not cancel request", {
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

  const pending = bookings.filter((booking) => booking.status === "pending").length;

  return (
    <div className="space-y-5">
      <p className="muted-text text-sm">
        {bookings.length} booking{bookings.length === 1 ? "" : "s"} · {pending} pending
      </p>

      <div className="space-y-4">
        {bookings.map((booking) => {
          const style = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;
          const Icon = style.icon;
          const isOpen = expanded === booking.id;
          const vendorName =
            booking.vendorBusinessName || booking.vendorName || "WedPlan Vendor";

          return (
            <article key={booking.id} className="theme-card overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-(--surface-muted) sm:h-24 sm:w-36">
                  {booking.serviceImage ? (
                    <Image
                      src={booking.serviceImage}
                      alt={booking.serviceName}
                      fill
                      unoptimized
                      sizes="144px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-(--text-secondary)">
                      <Inbox size={26} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-base font-semibold text-(--text-primary)">
                      {booking.serviceName}
                    </h3>
                    <Badge className={style.className}>
                      <Icon aria-hidden="true" />
                      {style.label}
                    </Badge>
                  </div>

                  <div className="muted-text flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="flex items-center gap-1">
                      <Store size={13} /> {vendorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} /> {formatDate(booking.eventDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {booking.eventLocation}
                    </span>
                  </div>

                  <p className="muted-text text-xs">
                    Requested {formatDate(booking.createdAt)} · {formatPrice(booking.price)}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpanded(isOpen ? null : booking.id)}
                      className="rounded-full"
                    >
                      View Details
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </Button>
                    {booking.status === "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === booking.id}
                        onClick={() => setPendingCancel(booking)}
                        className="rounded-full text-destructive hover:text-destructive"
                      >
                        {busyId === booking.id ? (
                          <>
                            <Loader2 className="animate-spin" /> Cancelling...
                          </>
                        ) : (
                          "Cancel Request"
                        )}
                      </Button>
                    )}

                    {booking.status === "rejected" && (
                      <Link
                        href={`/services/${booking.serviceId}`}
                        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-full")}
                      >
                        Request Again
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-3 border-t border-border bg-(--surface-muted)/40 px-4 py-4 sm:px-5">
                  <div>
                    <p className="muted-text text-[11px] font-medium uppercase tracking-wide">
                      Your message
                    </p>
                    <p className="mt-1 break-words text-sm text-(--text-primary)">
                  {booking.message}
                </p>
                  </div>
                  <div className="grid gap-3 text-xs sm:grid-cols-2">
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Vendor</span>
                      {vendorName}
                    </p>
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Event date</span>
                      {formatDate(booking.eventDate)}
                    </p>
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Event location</span>
                      {booking.eventLocation}
                    </p>
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Booking request date</span>
                      {formatDate(booking.createdAt)}
                    </p>
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Price</span>
                      {formatPrice(booking.price)}
                    </p>
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Status</span>
                      <span className="capitalize">{booking.status}</span>
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <AlertDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => {
          if (!open) setPendingCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking request?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{pendingCancel?.serviceName}&quot; will be cancelled. This can
              only be done while the request is still pending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep request</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmCancel()}>
              Cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
