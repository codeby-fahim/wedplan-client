"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  SearchX,
  SlidersHorizontal,
  Store,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  getPublicServices,
  type ServiceFilters,
  type ServiceRecord,
} from "@/lib/api/service-api";
import { authClient } from "@/lib/auth-client";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";

export default function PublicServicesGrid() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  // Debounce text inputs so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setDebouncedLocation(location.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search, location]);

  const load = useCallback(async (active: boolean, filters: ServiceFilters) => {
    setError(null);
    setRefreshing(true);

    try {
      const data = await getPublicServices(filters);
      if (active) setServices(data);
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Could not load services.");
      }
    } finally {
      if (active) {
        setLoading(false);
        setRefreshing(false);
        setLoadedOnce(true);
      }
    }
  }, []);

  // All filtering runs on the backend via query parameters.
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      void load(active, {
        search: debouncedSearch,
        category,
        location: debouncedLocation,
      });
    });

    return () => {
      active = false;
    };
  }, [load, debouncedSearch, category, debouncedLocation, requestId]);

  const hasFilters = Boolean(search.trim() || category || location.trim());

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
  };

  const openDetails = (id: string) => {
    if (sessionPending) return;

    if (!session) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/services/${id}`)}`);
      return;
    }

    router.push(`/services/${id}`);
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
          onClick={() => setRequestId((current) => current + 1)}
          className="rounded-full"
        >
          <RefreshCw /> Retry
        </Button>
      </Card>
    );
  }

  if (loading && !loadedOnce) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="theme-card animate-pulse overflow-hidden">
            <div className="aspect-video bg-(--surface-muted)" />
            <CardContent className="space-y-3 pt-4">
              <div className="h-4 w-3/4 rounded bg-(--surface-muted)" />
              <div className="h-3 w-1/2 rounded bg-(--surface-muted)" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="theme-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={17} className="text-(--brand)" />
          <h2 className="font-heading text-sm font-semibold text-(--text-primary)">
            Search & filter
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="service-search">Search by name</FieldLabel>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-secondary)"
              />
              <Input
                id="service-search"
                className="pl-9"
                placeholder="e.g. Photography"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="service-category">Category</FieldLabel>
            <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
              <SelectTrigger id="service-category">
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
            <FieldLabel htmlFor="service-location">Location</FieldLabel>
            <div className="relative">
              <MapPin
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-secondary)"
              />
              <Input
                id="service-location"
                className="pl-9"
                placeholder="e.g. Dhaka"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="muted-text flex items-center gap-2 text-xs">
            {refreshing && <Loader2 size={13} className="animate-spin text-(--brand)" />}
            {refreshing
              ? "Searching services..."
              : `${services.length} service${services.length === 1 ? "" : "s"} found`}
          </p>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="rounded-full"
            >
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {services.length === 0 && !hasFilters && (
        <Card className="theme-card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
            <SearchX size={26} />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold text-(--text-primary)">
            No services available yet
          </h2>
          <p className="muted-text mt-1 max-w-sm text-sm">
            We&apos;re reviewing new vendor listings. Check back soon for
            approved wedding services.
          </p>
        </Card>
      )}

      {services.length === 0 && hasFilters && !refreshing && (
        <Card className="theme-card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
            <SearchX size={26} />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold text-(--text-primary)">
            No matching services
          </h2>
          <p className="muted-text mt-1 max-w-sm text-sm">
            Try a different name, category or location.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="mt-5 rounded-full"
          >
            Clear filters
          </Button>
        </Card>
      )}

      {services.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const vendor = service.vendor;
            const vendorName = vendor?.businessName || vendor?.name || "WedPlan Vendor";

            return (
              <Card key={service.id} className="theme-card group overflow-hidden">
                <div className="relative aspect-video bg-(--surface-muted)">
                  {service.images?.[0] ? (
                    <Image
                      src={service.images[0]}
                      alt={service.serviceName}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="font-heading text-lg text-(--text-primary)">
                      {service.serviceName}
                    </CardTitle>
                    {service.status === "pending" && (
                      <Badge className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">
                        Pending approval
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{service.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="muted-text line-clamp-2 text-sm">{service.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-(--brand)">
                      $
                      {new Intl.NumberFormat("en-US", {
                        maximumFractionDigits: 2,
                      }).format(service.price)}
                    </span>
                    <span className="muted-text flex items-center gap-1 text-xs">
                      <MapPin size={13} /> {service.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 border-t border-border pt-3">
                    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--brand-soft) text-(--brand)">
                      {vendor?.image ? (
                        <Image
                          src={vendor.image}
                          alt={vendorName}
                          width={32}
                          height={32}
                          unoptimized
                          className="size-8 object-cover"
                        />
                      ) : (
                        <Store size={15} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="muted-text block text-[10px] uppercase tracking-wide">
                        Vendor
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate text-xs font-medium text-(--text-primary)">
                          {vendorName}
                        </span>
                        {vendor?.subscriptionPlan === "premium" && (
                          <Badge className="bg-[hsl(var(--success))] px-1.5 py-0 text-[10px] text-[hsl(var(--success-foreground))]">
                            Premium
                          </Badge>
                        )}
                      </span>
                    </span>
                  </div>

                  <Button
                    type="button"
                    onClick={() => openDetails(service.id)}
                    className="w-full rounded-full"
                  >
                    View Details <ArrowRight size={15} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
