"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="theme-card max-w-lg p-8 text-center sm:p-12">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle size={24} />
        </span>
        <h1 className="font-heading mt-4 text-2xl font-semibold text-(--text-primary)">
          We couldn&apos;t load this page
        </h1>
        <p className="muted-text mt-2 text-sm">
          Something went wrong on our side. You can try again or head back to
          safety.
        </p>
        {error.message && (
          <p className="muted-text mt-3 rounded-lg bg-(--surface-muted) px-3 py-2 text-left text-xs">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="rounded-full">
            <RefreshCw /> Try again
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
            Go home
          </Link>
        </div>
      </Card>
    </main>
  );
}
