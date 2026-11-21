"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  MapPin,
  RefreshCw,
  SearchX,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAdminServices,
  updateServiceStatus,
  type ServiceRecord,
  type ServiceStatus,
} from "@/lib/api/service-api";

const STATUS_STYLE: Record<
  ServiceStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  },
  approved: {
    label: "Approved",
    className: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive text-destructive-foreground",
  },
};

export default function AdminServicesList() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminServices();
      if (active) setServices(data);
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Could not load services.");
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

  const changeStatus = async (service: ServiceRecord, status: ServiceStatus) => {
    setBusyId(service.id);

    try {
      const updated = await updateServiceStatus(service.id, status);
      setServices((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success(`Service ${status}`, {
        description: `${service.serviceName} is now ${status}.`,
      });
    } catch (err) {
      toast.error("Could not update service", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="theme-card h-28 animate-pulse" />
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
              We couldn&apos;t load services
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

  if (services.length === 0) {
    return (
      <div className="theme-card flex flex-col items-center px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
          <SearchX size={26} />
        </span>
        <h2 className="mt-4 font-heading text-lg font-semibold text-(--text-primary)">
          No services submitted yet
        </h2>
        <p className="muted-text mt-1 max-w-sm text-sm">
          Vendor submissions will appear here for review.
        </p>
      </div>
    );
  }

  const pendingCount = services.filter((item) => item.status === "pending").length;

  return (
    <div className="space-y-5">
      <p className="muted-text text-sm">
        {services.length} total · {pendingCount} awaiting review
      </p>

      <div className="space-y-4">
        {services.map((service) => {
          const style = STATUS_STYLE[service.status] ?? STATUS_STYLE.pending;
          const isBusy = busyId === service.id;

          return (
            <article key={service.id} className="theme-card p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-(--surface-muted) sm:h-24 sm:w-36">
                  {service.images?.[0] ? (
                    <Image
                      src={service.images[0]}
                      alt={service.serviceName}
                      fill
                      unoptimized
                      sizes="144px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-base font-semibold text-(--text-primary)">
                      {service.serviceName}
                    </h3>
                    <Badge className={style.className}>{style.label}</Badge>
                  </div>
                  <p className="muted-text text-xs">{service.category}</p>
                  <p className="muted-text line-clamp-2 text-sm">
                    {service.description}
                  </p>
                  <div className="muted-text flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-medium text-(--brand)">
                      ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(service.price)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {service.location}
                    </span>
                    <span>Vendor: {service.vendorId}</span>
                  </div>

                  {service.status !== "pending" && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {service.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void changeStatus(service, "rejected")}
                          className="rounded-full"
                        >
                          <X /> Reject
                        </Button>
                      )}
                      {service.status === "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void changeStatus(service, "approved")}
                          className="rounded-full"
                        >
                          <Check /> Approve
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {service.status === "pending" && (
                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void changeStatus(service, "approved")}
                      className="flex-1 rounded-full sm:flex-none"
                    >
                      <Check /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => void changeStatus(service, "rejected")}
                      className="flex-1 rounded-full sm:flex-none"
                    >
                      <X /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
