import DashboardPage from "@/components/shared/dashboard-page";
import VendorProfileForm from "@/components/shared/vendor-profile-form";

export const metadata = { title: "Vendor Profile Settings" };

export default function VendorProfilePage() {
  return (
    <DashboardPage
      title="Profile Settings"
      description="Update your business details and account information."
    >
      <VendorProfileForm />
    </DashboardPage>
  );
}
