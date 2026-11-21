"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  Crown,
  Loader2,
  RefreshCw,
  Sparkles,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVendorStats, type VendorStats } from "@/lib/api/service-api";
import {
  createCheckoutSession,
  verifyPayment,
} from "@/lib/api/subscription-api";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "Maximum 3 Active Services",
  "Basic Vendor Dashboard",
  "Booking Request Management",
];

const PREMIUM_FEATURES = [
  "Unlimited Active Services",
  "Premium Vendor Badge",
  "All Free Plan Features",
];

export default function VendorSubscription() {
  const router = useRouter();

  const [stats, setStats] = useState<VendorStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const load = useCallback(async (active: boolean) => {
    setError(null);

    try {
      const data = await getVendorStats();
      if (active) setStats(data);
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Could not load your plan.");
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

  const handleUpgrade = async () => {
    setUpgrading(true);

    try {
      const url = await createCheckoutSession();
      window.location.assign(url);
    } catch (err) {
      toast.error("Could not start checkout", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
      setUpgrading(false);
    }
  };

  // Handle the redirect back from Stripe sandbox checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (payment) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (payment === "cancelled") {
      toast.info("Checkout cancelled", {
        description: "You can upgrade whenever you're ready.",
      });
    }

    if (payment === "success") {
      if (!sessionId) return;

      void (async () => {
        try {
          await verifyPayment(sessionId);
          setStats((current) =>
            current
              ? { ...current, subscriptionPlan: "premium", activeServiceLimit: null }
              : current
          );
          toast.success("Welcome to Premium!", {
            description: "You can now publish unlimited active services.",
          });
          router.refresh();
        } catch (err) {
          toast.error("Could not confirm your payment", {
            description: err instanceof Error ? err.message : "Please try again.",
          });
        }
      })();
    }
  }, [router]);

  if (error) {
    return (
      <Card className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
          <div>
            <p className="font-medium text-(--text-primary)">
              We couldn&apos;t load your subscription
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
    return <div className="theme-card h-64 animate-pulse" />;
  }

  const isPremium = stats.subscriptionPlan === "premium";

  return (
    <div className="space-y-6">
      <Card className="theme-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="muted-text text-xs uppercase tracking-wide">Current plan</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="font-heading text-xl font-semibold capitalize text-(--text-primary)">
              {stats.subscriptionPlan}
            </h2>
            <Badge
              className={
                isPremium
                  ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
                  : "bg-secondary text-secondary-foreground"
              }
            >
              {isPremium ? <Crown size={13} /> : null}
              {isPremium ? "Premium member" : "Free member"}
            </Badge>
          </div>
          <p className="muted-text mt-1 text-sm">
            {isPremium
              ? "You have unlimited active services."
              : `${stats.activeServices} of ${stats.activeServiceLimit} active services used.`}
          </p>
        </div>
        {!isPremium && (
          <Button
            onClick={() => setConfirmOpen(true)}
            className="rounded-full"
          >
            <Sparkles /> Upgrade to Premium
          </Button>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          className={cn(
            "theme-card flex flex-col",
            !isPremium && "border-(--brand) shadow-md"
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="font-heading text-xl text-(--text-primary)">
                Free Plan
              </CardTitle>
              {!isPremium && <Badge variant="secondary">Current plan</Badge>}
            </div>
            <p className="muted-text mt-1 text-sm">
              Everything you need to get started as a wedding vendor.
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-heading text-3xl font-semibold text-(--text-primary)">
                $0
              </span>
              <span className="muted-text text-sm">/ forever</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <ul className="space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0 text-(--brand)" />
                  <span className="text-(--text-primary)">{feature}</span>
                </li>
              ))}
            </ul>
            {isPremium && (
              <p className="muted-text mt-auto pt-6 text-xs">
                You&apos;ve outgrown this plan.
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          className={cn(
            "theme-card flex flex-col",
            isPremium && "border-(--brand) shadow-md"
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="font-heading text-xl text-(--text-primary)">
                Premium Plan
              </CardTitle>
              {isPremium && (
                <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                  Current plan
                </Badge>
              )}
            </div>
            <p className="muted-text mt-1 text-sm">
              For vendors ready to grow without limits.
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-heading text-3xl font-semibold text-(--text-primary)">
                $100
              </span>
              <span className="muted-text text-sm">/ month</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0 text-(--brand)" />
                  <span className="text-(--text-primary)">{feature}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <Button disabled className="mt-auto w-full rounded-full">
                <Crown /> You&apos;re on Premium
              </Button>
            ) : (
              <Button
                onClick={() => setConfirmOpen(true)}
                className="mt-auto w-full rounded-full"
              >
                <Sparkles /> Upgrade to Premium
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to Premium?</AlertDialogTitle>
            <AlertDialogDescription>
              Your active-service limit will be removed immediately and you&apos;ll
              get the Premium Vendor Badge.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={upgrading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleUpgrade()} disabled={upgrading}>
              {upgrading ? (
                <>
                  <Loader2 className="animate-spin" /> Upgrading...
                </>
              ) : (
                "Upgrade now"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
