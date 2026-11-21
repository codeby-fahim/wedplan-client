"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAdminTransactions,
  type AdminTransaction,
} from "@/lib/api/admin-api";

function formatAmount(amount: number, currency: string) {
  return `${new Intl.NumberFormat("en-US").format(amount)} ${currency.toUpperCase()}`;
}

function statusClass(status: string) {
  if (status === "paid")
    return "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]";
  if (status === "pending")
    return "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]";
  return "bg-secondary text-secondary-foreground";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminTransactionsList() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(async (active: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminTransactions();
      if (active) setTransactions(data);
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Could not load transactions.");
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

  if (error) {
    return (
      <Card className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
          <div>
            <p className="font-medium text-(--text-primary)">
              We couldn&apos;t load transactions
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

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="theme-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="theme-card flex flex-col items-center px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
          <CreditCard size={26} />
        </span>
        <h2 className="mt-4 font-heading text-lg font-semibold text-(--text-primary)">
          No transactions yet
        </h2>
        <p className="muted-text mt-1 max-w-sm text-sm">
          Successful Premium payments will appear here automatically. Payment
          records are read-only.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="muted-text text-sm">
          {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
        </p>
        <Badge variant="secondary">
          <ShieldCheck size={12} /> Read-only records
        </Badge>
      </div>

      <Card className="theme-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-(--surface-muted)/50 text-xs uppercase tracking-wide text-(--text-secondary)">
              <tr>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="text-(--text-primary)">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Store size={15} className="shrink-0 text-(--brand)" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{transaction.vendorName}</p>
                        <p className="muted-text truncate text-xs">
                          {transaction.vendorEmail ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{transaction.plan}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusClass(transaction.status)}>
                      <CheckCircle2 size={12} />
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="muted-text px-4 py-3 text-xs">
                    {transaction.createdAt ? formatDate(transaction.createdAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="muted-text text-xs">
        Transactions are created only by verified Stripe payments. There is no
        admin action that can change a payment status.
      </p>
    </div>
  );
}
