"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

import AddServiceForm from "@/components/shared/add-service-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getVendorServiceById,
  type ServiceRecord,
} from "@/lib/api/service-api";

export default function EditService() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [service, setService] = useState<ServiceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const load = useCallback(
    async (active: boolean) => {
      setError(null);

      try {
        const data = await getVendorServiceById(id);
        if (active) setService(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load the service.");
        }
      }
    },
    [id]
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      void load(active);
    });

    return () => {
      active = false;
    };
  }, [load, requestId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/vendor/services"
          className="muted-text inline-flex items-center gap-2 text-sm hover:text-(--brand)"
        >
          <ArrowLeft size={16} /> Back to My Services
        </Link>
        {service && (
          <Badge variant="outline" className="capitalize">
            {service.status}
          </Badge>
        )}
      </div>

      {error && (
        <div className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
            <div>
              <p className="font-medium text-(--text-primary)">
                We couldn&apos;t load this service
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
        </div>
      )}

      {!error && !service && <div className="theme-card h-64 animate-pulse" />}

      {service && <AddServiceForm initialService={service} />}
    </div>
  );
}
