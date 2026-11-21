import CustomerBookingsList from "@/components/shared/customer-bookings-list";
import DashboardPage from "@/components/shared/dashboard-page";

export const metadata = { title: "My Bookings" };

export default function CustomerBookingsPage() {
  return (
    <DashboardPage
      title="My Bookings"
      description="Track the wedding services you have requested and booked."
    >
      <CustomerBookingsList />
    </DashboardPage>
  );
}
