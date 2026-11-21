import AdminServicesList from "@/components/shared/admin-services-list";
import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Manage Services" };

export default function AdminServicesPage() {
  return (
    <DashboardPage
      title="Manage Services"
      description="Review vendor submissions and approve or reject them."
    >
      <AdminServicesList />
    </DashboardPage>
  );
}
