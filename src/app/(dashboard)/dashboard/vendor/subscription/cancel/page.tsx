import Link from "next/link";
import { ArrowLeft, CreditCard, RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DashboardPage from "@/components/shared/dashboard-page";
import { cn } from "@/lib/utils";

export const metadata = { title: "Payment Cancelled" };

export default function PaymentCancelPage() {
  return (
    <DashboardPage
      title="Payment Cancelled"
      description="Your Premium upgrade was not completed."
    >
      <div className="mx-auto w-full max-w-2xl">
        <Card className="theme-card p-8 text-center sm:p-12">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-(--brand-soft) text-(--brand)">
            <CreditCard size={28} />
          </span>
          <h2 className="font-heading mt-4 text-2xl font-semibold text-(--text-primary)">
            Upgrade cancelled
          </h2>
          <p className="muted-text mx-auto mt-2 max-w-md text-sm">
            You cancelled the checkout before completing payment. No charge was
            made and your plan is unchanged. You can try again whenever you&apos;re
            ready.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/vendor/subscription"
              className={cn(buttonVariants(), "rounded-full")}
            >
              <RotateCcw /> Try again
            </Link>
            <Link
              href="/dashboard/vendor"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full"
              )}
            >
              <ArrowLeft /> Back to dashboard
            </Link>
          </div>
        </Card>

        <p className="muted-text mt-4 text-center text-xs">
          Need help? Contact WedPlan support and we&apos;ll be happy to assist.
        </p>
      </div>
    </DashboardPage>
  );
}
