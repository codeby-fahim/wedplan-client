"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-10 text-sm text-(--text-secondary)"
    >
      <RefreshCw size={16} className="animate-spin text-(--brand)" />
      {label}
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="theme-card h-36 animate-pulse" />
      ))}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  icon: Icon = AlertCircle,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Card className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 shrink-0 text-destructive" size={20} />
        <div>
          <p className="font-medium text-(--text-primary)">{title}</p>
          <p className="muted-text text-sm">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="rounded-full">
          <RefreshCw /> Retry
        </Button>
      )}
    </Card>
  );
}
