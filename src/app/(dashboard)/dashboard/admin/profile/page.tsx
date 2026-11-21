import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Admin Profile Settings" };

export default function AdminProfilePage() {
  return (
    <DashboardPage
      title="Profile Settings"
      description="View your admin account information."
    />
  );
}
