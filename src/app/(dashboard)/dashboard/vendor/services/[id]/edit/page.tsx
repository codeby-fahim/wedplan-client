import { Suspense } from "react";

import EditService from "@/components/shared/edit-service";

export default function EditServicePage() {
  return (
    <Suspense fallback={<div className="theme-card h-64 animate-pulse" />}>
      <EditService />
    </Suspense>
  );
}
