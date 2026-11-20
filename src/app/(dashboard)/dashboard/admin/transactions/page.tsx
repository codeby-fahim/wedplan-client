import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Transactions" };

export default function AdminTransactionsPage() {
  return (
    <DashboardPage
      title="Transactions"
      description="Monitor platform payments, payouts and subscriptions."
    />
  );
}
