import type { Metadata } from "next";
import { Suspense } from "react";

import ServiceDetail from "@/components/shared/service-detail";

export const metadata: Metadata = {
  title: "Service Details",
  description: "View service details and send a booking request.",
};

export default function ServiceDetailPage() {
  return (
    <Suspense fallback={<div className="theme-card m-6 h-72 animate-pulse" />}>
      <ServiceDetail />
    </Suspense>
  );
}
