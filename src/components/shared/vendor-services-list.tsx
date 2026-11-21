"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Crown,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
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
  deleteService,
  getMyServices,
  getVendorStats,
  setServiceAvailability,
  type ServiceRecord,
  type ServiceStatus,
  type VendorStats,
} from "@/lib/api/service-api";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<
  ServiceStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "Pending",
    className: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    className: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive text-destructive-foreground",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon aria-hidden="true" />
      {config.label}
    </Badge>
  );
}

function formatPrice(price: number) {
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(price)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function VendorServicesList() {
  const servicesRef = useRef<ServiceRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceRecord | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const [serviceData, statsData] = await Promise.all([
        getMyServices(),
        getVendorStats(),
      ]);
      if (active) {
        servicesRef.current = serviceData;
        setServices(serviceData);
        setStats(statsData);
      }
    } catch (err) {
      if (active) {
        setError(
          err instanceof Error ? err.message : "Could not load your services."
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

  const refresh = () => setRequestId((current) => current + 1);

  const toggleAvailability = async (service: ServiceRecord) => {
    setBusyId(service.id);

    try {
      const updated = await setServiceAvailability(service.id, !service.isActive);
      const nextServices = servicesRef.current.map((item) =>
        item.id === updated.id ? updated : item
      );
      servicesRef.current = nextServices;
      setServices(nextServices);
      setStats((current) =>
        current
          ? {
              ...current,
              activeServices: nextServices.filter(
                (item) => item.status === "approved" && item.isActive
              ).length,
            }
          : current
      );
      toast.success(updated.isActive ? "Service is now active" : "Service is now inactive", {
        description: updated.serviceName,
      });
    } catch (err) {
      toast.error("Could not change availability", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    const target = pendingDelete;
    setBusyId(target.id);
    setPendingDelete(null);

    try {
      await deleteService(target.id);
      toast.success("Service deleted", { description: target.serviceName });
      refresh();
    } catch (err) {
      toast.error("Could not delete service", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const atFreeLimit =
    stats !== null &&
    stats.activeServiceLimit !== null &&
    stats.activeServices >= stats.activeServiceLimit;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="muted-text text-sm">
          {loading
            ? "Loading your services..."
            : `${services.length} service${services.length === 1 ? "" : "s"} submitted`}
        </p>
        <Link
          href="/dashboard/vendor/services/new"
          className={cn(buttonVariants(), "rounded-full")}
        >
          <Plus /> Add Service
        </Link>
      </div>

      {!loading && stats && atFreeLimit && (
        <div className="flex items-start gap-2 rounded-lg border border-(--brand)/20 bg-(--brand-soft)/50 px-3 py-2.5 text-xs text-(--text-secondary)">
          <Crown size={15} className="mt-0.5 shrink-0 text-(--brand)" />
          <p>
            You&apos;ve reached the free plan limit of{" "}
            <strong className="text-(--text-primary)">
              {stats.activeServiceLimit} active services
            </strong>
            . Upgrade to Premium to publish unlimited services.
          </p>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="theme-card animate-pulse overflow-hidden"
            >
              <div className="aspect-video bg-(--surface-muted)" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-(--surface-muted)" />
                <div className="h-3 w-1/2 rounded bg-(--surface-muted)" />
                <div className="h-3 w-full rounded bg-(--surface-muted)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
            <div>
              <p className="font-medium text-(--text-primary)">
                We couldn&apos;t load your services
              </p>
              <p className="muted-text text-sm">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} className="rounded-full">
            <RefreshCw /> Retry
          </Button>
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="theme-card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
            <ImageIcon size={26} />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold text-(--text-primary)">
            No services yet
          </h2>
          <p className="muted-text mt-1 max-w-sm text-sm">
            Publish your first wedding service and track its approval status right here.
          </p>
          <Link
            href="/dashboard/vendor/services/new"
            className={cn(buttonVariants(), "mt-5 rounded-full")}
          >
            <Plus /> Add your first service
          </Link>
        </div>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const cover = service.images?.[0];
            const isBusy = busyId === service.id;

            return (
              <article
                key={service.id}
                className="theme-card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video bg-(--surface-muted)">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={service.serviceName}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-(--text-secondary)">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={service.status} />
                  </div>
                  {service.images?.length > 1 && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
                      +{service.images.length - 1} more
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col space-y-3 p-4">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-(--text-primary)">
                      {service.serviceName}
                    </h3>
                    <p className="muted-text text-xs">{service.category}</p>
                  </div>

                  <p className="muted-text line-clamp-2 text-sm">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="font-semibold text-(--brand)">
                      {formatPrice(service.price)}
                    </span>
                    <span className="muted-text flex items-center gap-1 text-xs">
                      <MapPin size={13} /> {service.location}
                    </span>
                  </div>

                  <div className="muted-text flex items-center justify-between border-t border-border pt-3 text-[11px]">
                    <span>Submitted {formatDate(service.createdAt)}</span>
                    <span className="capitalize">
                      {service.isActive ? "Active listing" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <Link
                      href={`/dashboard/vendor/services/${service.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "rounded-full"
                      )}
                    >
                      <Pencil /> Edit
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => void toggleAvailability(service)}
                      className="rounded-full"
                    >
                      {service.isActive ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isBusy}
                      onClick={() => setPendingDelete(service)}
                      className="rounded-full text-destructive hover:text-destructive"
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{pendingDelete?.serviceName}&quot; and its booking requests
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>
              Delete service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
