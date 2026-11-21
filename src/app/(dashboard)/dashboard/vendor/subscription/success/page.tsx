import DashboardPage from "@/components/shared/dashboard-page";
import PaymentSuccess from "@/components/shared/payment-success";

export const metadata = { title: "Payment Confirmation" };

export default function PaymentSuccessPage() {
  return (
    <DashboardPage
      title="Payment Confirmation"
      description="Your Premium upgrade confirmation."
    >
      <PaymentSuccess />
    </DashboardPage>
  );
}
