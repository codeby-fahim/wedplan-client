"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, MapPin, Store } from "lucide-react";

import { ErrorState, SkeletonCards } from "@/components/shared/async-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getFeaturedServices,
  type ServiceRecord,
} from "@/lib/api/service-api";
import { authClient } from "@/lib/auth-client";

export default function FeaturedServices() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getFeaturedServices();
      if (active) setServices(data);
    } catch (err) {
      if (active) {
        setError(
          err instanceof Error ? err.message : "Could not load featured services."
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

  const openDetails = (id: string) => {
    if (sessionPending) return;
    if (!session) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/services/${id}`)}`);
      return;
    }
    router.push(`/services/${id}`);
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
        initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-(--brand) uppercase">
            Handpicked for your celebration
          </p>
          <h2 className="font-heading mt-2 text-3xl font-semibold text-(--text-primary) sm:text-4xl">
            Featured Wedding Services
          </h2>
          <p className="muted-text mt-3 max-w-xl text-sm">
            Approved and active services from trusted vendors across the platform.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/services")}
          className="rounded-full"
        >
          View all services <ArrowRight size={15} />
        </Button>
      </motion.div>

      {error && (
        <ErrorState
          title="We couldn't load featured services"
          message={error}
          onRetry={() => setRequestId((current) => current + 1)}
        />
      )}

      {loading && !error && <SkeletonCards count={6} />}

      {!loading && !error && services.length === 0 && (
        <Card className="theme-card px-6 py-14 text-center">
          <h3 className="font-heading text-lg font-semibold text-(--text-primary)">
            No featured services yet
          </h3>
          <p className="muted-text mx-auto mt-2 max-w-sm text-sm">
            Approved services will appear here soon. You can still explore
            everything available.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/services")}
            className="mt-5 rounded-full"
          >
            Browse services
          </Button>
        </Card>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const vendor = service.vendor;
            const vendorName =
              vendor?.businessName || vendor?.name || "WedPlan Vendor";

            return (
              <motion.div
                key={service.id}
                initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: "easeOut",
                }}
              >
              <Card className="theme-card group overflow-hidden">
                <div className="relative aspect-video bg-(--surface-muted)">
                  {service.images?.[0] && (
                    <Image
                      src={service.images[0]}
                      alt={service.serviceName}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-heading text-lg text-(--text-primary)">
                    {service.serviceName}
                  </CardTitle>
                  <CardDescription>{service.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
