import Hero from "@/components/shared/hero";
import WhyChooseWedPlan from "@/components/home/WhyChooseWedPlan";
import HowItWorks from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <WhyChooseWedPlan />
      <HowItWorks />
    </main>
  );
}
