import AdminTransactionsList from "@/components/shared/admin-transactions-list";
import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Transactions" };

export default function AdminTransactionsPage() {
  return (
    <DashboardPage
      title="Transactions"
      description="Monitor platform payments and subscription records."
    >
      <AdminTransactionsList />
    </DashboardPage>
  );
}
