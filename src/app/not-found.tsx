import Link from "next/link";
import { Compass, Home } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="theme-card max-w-lg p-8 text-center sm:p-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-(--brand) uppercase">
          Error 404
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold text-(--text-primary) sm:text-4xl">
          This page doesn&apos;t exist
        </h1>
        <p className="muted-text mx-auto mt-3 max-w-sm text-sm">
          The link may be broken, or the page may have moved. Let&apos;s get you
          back to something useful.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className={cn(buttonVariants(), "rounded-full")}>
            <Home /> Go home
          </Link>
          <Link
            href="/services"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
          >
            <Compass /> Browse services
          </Link>
        </div>
      </Card>
    </main>
  );
}
