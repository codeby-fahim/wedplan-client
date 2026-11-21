import CustomerProfileForm from "@/components/shared/customer-profile-form";
import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Admin Profile Settings" };

export default function AdminProfilePage() {
  return (
    <DashboardPage
      title="Profile Settings"
      description="Manage your admin account information."
    >
      <CustomerProfileForm />
    </DashboardPage>
  );
}
