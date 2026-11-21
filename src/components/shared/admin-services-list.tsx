"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  SearchX,
  Trash2,
  X,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteService,
  getAdminServices,
  updateServiceStatus,
  type ServiceRecord,
  type ServiceStatus,
} from "@/lib/api/service-api";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceRecord | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (
      active: boolean,
      filters: { search?: string; category?: string; status?: string }
    ) => {
      setError(null);
      setRefreshing(true);

      try {
        const data = await getAdminServices(filters);
        if (active) setServices(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load services.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      void load(active, {
        search: debouncedSearch,
        category,
        status,
      });
    });
    return () => {
      active = false;
    };
  }, [load, debouncedSearch, category, status, requestId]);

  const changeStatus = async (service: ServiceRecord, next: ServiceStatus) => {
    setBusyId(service.id);

    try {
      const updated = await updateServiceStatus(service.id, next);
      setServices((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success(`Service ${next}`, {
        description: service.serviceName,
      });
    } catch (err) {
      toast.error("Could not update service", {
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
      setServices((current) => current.filter((item) => item.id !== target.id));
      toast.success("Service deleted", { description: target.serviceName });
    } catch (err) {
      toast.error("Could not delete service", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (error) {
    return (
      <Card className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
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
          onClick={() => {
            setSearch("");
            setDebouncedSearch("");
            setCategory("");
            setStatus("");
            setRequestId((current) => current + 1);
          }}
          className="rounded-full"
        >
          <RefreshCw /> Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="theme-card p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="admin-service-search">Search by name</FieldLabel>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-secondary)"
              />
              <Input
                id="admin-service-search"
                className="pl-9"
                placeholder="e.g. Photography"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="admin-service-category">Category</FieldLabel>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value ?? "")}
            >
              <SelectTrigger id="admin-service-category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="admin-service-status">Status</FieldLabel>
            <Select value={status} onValueChange={(value) => setStatus(value ?? "")}>
              <SelectTrigger id="admin-service-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <p className="muted-text mt-4 text-xs">
          {refreshing ? "Searching services..." : `${services.length} service(s) found`}
        </p>
      </Card>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="theme-card h-28 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="theme-card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
            <SearchX size={26} />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold text-(--text-primary)">
            No services found
          </h2>
          <p className="muted-text mt-1 text-sm">
            Try a different search or filter.
          </p>
        </div>
      )}

      {!loading && services.length > 0 && (
        <div className="space-y-4">
          {services.map((service) => {
            const style = STATUS_STYLE[service.status] ?? STATUS_STYLE.pending;
            const isBusy = busyId === service.id;

            return (
              <article key={service.id} className="theme-card p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-(--surface-muted) sm:h-24 sm:w-36">
                    {service.images?.[0] && (
                      <Image
                        src={service.images[0]}
                        alt={service.serviceName}
                        fill
                        unoptimized
                        sizes="144px"
                        className="object-cover"
                      />
                    )}
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
                        $
                        {new Intl.NumberFormat("en-US", {
                          maximumFractionDigits: 2,
                        }).format(service.price)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {service.location}
                      </span>
                      <span className="break-all">Vendor: {service.vendorId}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {service.status !== "approved" && (
                        <Button
                          size="sm"
                          disabled={isBusy}
                          onClick={() => void changeStatus(service, "approved")}
                          className="rounded-full"
                        >
                          {isBusy ? <Loader2 className="animate-spin" /> : <Check />}
                          {isBusy ? "Processing..." : "Approve"}
                        </Button>
                      )}
                      {service.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void changeStatus(service, "rejected")}
                          className="rounded-full"
                        >
                          {isBusy ? <Loader2 className="animate-spin" /> : <X />}
                          {isBusy ? "Processing..." : "Reject"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isBusy}
                        onClick={() => setPendingDelete(service)}
                        className="rounded-full text-destructive hover:text-destructive"
                      >
                        {isBusy ? <Loader2 className="animate-spin" /> : <Trash2 />}
                        {isBusy ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
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
              will be permanently removed from the platform.
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
