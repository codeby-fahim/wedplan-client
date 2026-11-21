"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, MapPin, RefreshCw, Store } from "lucide-react";

import BookingForm from "@/components/shared/booking-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPublicServiceById,
  type ServiceRecord,
} from "@/lib/api/service-api";
import { authClient } from "@/lib/auth-client";

export default function ServiceDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [service, setService] = useState<ServiceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(
    async (active: boolean) => {
      setError(null);

      try {
        const data = await getPublicServiceById(id);
        if (active) setService(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load the service.");
        }
      }
    },
    [id]
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      void load(active);
    });

    return () => {
      active = false;
    };
  }, [load, requestId]);

  // Viewing details is a signed-in action; browsing the list stays public.
  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace(
        `/sign-in?callbackUrl=${encodeURIComponent(`/services/${id}`)}`
      );
    }
  }, [session, sessionPending, router, id]);

  if (sessionPending || !session) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="muted-text text-sm">Redirecting you to sign in...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="muted-text inline-flex items-center gap-2 text-sm hover:text-(--brand)"
      >
        <ArrowLeft size={16} /> Back to services
      </Link>

      {error && (
        <div className="theme-card mt-6 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
            <div>
              <p className="font-medium text-(--text-primary)">
                We couldn&apos;t load this service
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
      )}

      {!error && !service && <div className="theme-card mt-6 h-72 animate-pulse" />}

      {service && (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-(--surface-muted)">
              {service.images?.[0] && (
                <Image
                  src={service.images[0]}
                  alt={service.serviceName}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              )}
            </div>

            {service.images && service.images.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {service.images.slice(1).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-lg bg-(--surface-muted)"
                  >
                    <Image
                      src={image}
                      alt={`${service.serviceName} ${index + 2}`}
                      fill
                      unoptimized
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="theme-card mt-6 p-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-(--brand) uppercase">
                {service.category}
              </p>
              <h1 className="font-heading mt-2 text-2xl font-semibold text-(--text-primary) sm:text-3xl">
                {service.serviceName}
              </h1>
              <p className="muted-text mt-3 whitespace-pre-line text-sm">
                {service.description}
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-lg bg-(--surface-muted) px-3 py-2.5">
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--brand-soft) text-(--brand)">
                  {service.vendor?.image ? (
                    <Image
                      src={service.vendor.image}
                      alt={service.vendor.name ?? "Vendor"}
                      width={40}
                      height={40}
                      unoptimized
                      className="size-10 object-cover"
                    />
                  ) : (
                    <Store size={18} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="muted-text block text-[10px] uppercase tracking-wide">
                    Provided by
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="block truncate text-sm font-medium text-(--text-primary)">
                      {service.vendor?.businessName ||
                        service.vendor?.name ||
                        "WedPlan Vendor"}
                    </span>
                    {service.vendor?.subscriptionPlan === "premium" && (
                      <Badge className="bg-[hsl(var(--success))] px-1.5 py-0 text-[10px] text-[hsl(var(--success-foreground))]">
                        Premium
                      </Badge>
                    )}
                  </span>
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4">
                <span className="text-xl font-semibold text-(--brand)">
                  $
                  {new Intl.NumberFormat("en-US", {
                    maximumFractionDigits: 2,
                  }).format(service.price)}
                </span>
                <span className="muted-text flex items-center gap-1 text-sm">
                  <MapPin size={15} /> {service.location}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {service.status === "approved" && service.isActive ? (
              <BookingForm service={service} />
            ) : (
              <div className="theme-card p-6">
                <div className="flex items-start gap-2 rounded-lg border border-(--brand)/20 bg-(--brand-soft)/50 px-3 py-2.5 text-xs text-(--text-secondary)">
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-(--brand)" />
                  <p>
                    This service is <strong className="text-(--text-primary)">pending approval</strong>{" "}
                    and isn&apos;t available for booking yet. Please check back soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
