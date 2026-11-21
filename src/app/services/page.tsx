import type { Metadata } from "next";

import PublicServicesGrid from "@/components/shared/public-services-grid";

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Explore approved wedding services from trusted vendors on WedPlan.",
};

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-(--brand) uppercase">
          Curated for your big day
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold text-(--text-primary) sm:text-4xl">
          Browse Wedding Services
        </h1>
        <p className="muted-text mt-3 max-w-2xl text-sm sm:text-base">
          Discover photography, venues, catering and more from vendors
          approved by WedPlan.
        </p>
      </div>

      <PublicServicesGrid />
    </main>
  );
}
