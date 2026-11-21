import AdminUsersList from "@/components/shared/admin-users-list";
import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "Manage Users" };

export default function AdminUsersPage() {
  return (
    <DashboardPage
      title="Manage Users"
      description="Review customers, vendors and their account status."
    >
      <AdminUsersList />
    </DashboardPage>
  );
}
