import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Customer Profile Settings" };

export default function CustomerProfilePage() {
  return (
    <DashboardPage
      title="Profile Settings"
      description="Manage your personal details and wedding preferences."
    />
  );
}
