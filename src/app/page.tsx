import CategoryShowcase from "@/components/home/category-showcase";
import FeaturedServices from "@/components/home/featured-services";
import Hero from "@/components/shared/hero";
import WhyChooseWedPlan from "@/components/home/WhyChooseWedPlan";
import HowItWorks from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <FeaturedServices />
      <CategoryShowcase />
      <WhyChooseWedPlan />
      <HowItWorks />
    </main>
  );
}
