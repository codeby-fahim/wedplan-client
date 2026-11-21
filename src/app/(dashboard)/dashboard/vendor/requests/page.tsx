import DashboardPage from "@/components/shared/dashboard-page";
import VendorBookingsList from "@/components/shared/vendor-bookings-list";

export const metadata = { title: "Booking Requests" };

export default function VendorRequestsPage() {
  return (
    <DashboardPage
      title="Booking Requests"
      description="Review and manage incoming booking requests from couples."
    >
      <VendorBookingsList />
    </DashboardPage>
  );
}
