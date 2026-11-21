"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getSubscriptionStatus,
  type SubscriptionStatus,
} from "@/lib/api/subscription-api";
import { cn } from "@/lib/utils";

const STATUS_MESSAGES: Record<string, { title: string; description: string }> = {
  paid: {
    title: "Payment confirmed",
    description:
      "Stripe has confirmed your payment. Your Premium plan is now active.",
  },
  pending: {
    title: "Payment received — awaiting confirmation",
    description:
      "We're waiting for Stripe to confirm the payment. Premium will activate automatically once the webhook arrives — you don't need to do anything else.",
  },
  cancelled: {
    title: "Subscription cancelled",
    description: "This subscription is no longer active.",
  },
  expired: {
    title: "Subscription expired",
    description: "This subscription is no longer active.",
  },
  past_due: {
    title: "Payment past due",
    description: "Please check your Stripe billing details to restore access.",
  },
};

export default function PaymentSuccess() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setLoading(true);
    setError(null);

    const sessionId =
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("session_id") ?? "";

    try {
      const data = await getSubscriptionStatus(sessionId || undefined);
      if (active) setStatus(data);
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Could not load your payment status.");
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

  const message = STATUS_MESSAGES[status?.transaction?.status ?? "pending"];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <Card className="theme-card p-6 text-center sm:p-8">
        <span
          className={cn(
            "mx-auto flex size-14 items-center justify-center rounded-full",
            status?.transaction?.status === "paid"
              ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
              : "bg-(--brand-soft) text-(--brand)"
          )}
        >
          {status?.transaction?.status === "paid" ? (
            <CheckCircle2 size={28} />
          ) : (
            <CreditCard size={28} />
          )}
        </span>

        <h2 className="font-heading mt-4 text-2xl font-semibold text-(--text-primary)">
          {error ? "Payment status unavailable" : message.title}
        </h2>
        <p className="muted-text mx-auto mt-2 max-w-md text-sm">
          {error ??
            message.description}
        </p>

        {status?.transaction && (
          <div className="mt-6 rounded-lg bg-(--surface-muted) px-4 py-3 text-left text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="muted-text">Plan</span>
              <span className="font-medium capitalize text-(--text-primary)">
                {status.transaction.plan}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="muted-text">Amount</span>
              <span className="font-medium text-(--text-primary)">
                {new Intl.NumberFormat("en-US").format(status.transaction.amount)}{" "}
                {(status.transaction.currency ?? "bdt").toUpperCase()}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="muted-text">Status</span>
              <Badge variant="secondary" className="capitalize">
                {status.transaction.status}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="muted-text">Current plan</span>
              <span className="font-medium capitalize text-(--text-primary)">
                {status.plan}
              </span>
            </div>
          </div>
        )}

        {loading && (
          <p className="muted-text mt-6 flex items-center justify-center gap-2 text-xs">
            <RefreshCw size={13} className="animate-spin" /> Checking payment status...
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setRequestId((current) => current + 1)}
            className="rounded-full"
          >
            <RefreshCw /> Check status
          </Button>
          <Link
            href="/dashboard/vendor/subscription"
            className={cn(buttonVariants(), "rounded-full")}
          >
            Back to Subscription
          </Link>
        </div>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-(--brand)/20 bg-(--brand-soft)/50 px-3 py-2.5 text-xs text-(--text-secondary)">
        {status?.transaction?.status === "pending" ? (
          <Clock3 size={15} className="mt-0.5 shrink-0 text-(--brand)" />
        ) : (
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-(--brand)" />
        )}
        <p>
          Premium access is never activated from this page. Only a signed
          Stripe webhook can confirm your payment and update your plan.
        </p>
      </div>
    </div>
  );
}
