"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Camera,
  Flower2,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { FEATURED_CATEGORIES } from "@/lib/service-categories";

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  building: Building2,
  flower: Flower2,
  utensils: UtensilsCrossed,
  sparkles: Sparkles,
  shirt: Shirt,
};

export default function CategoryShowcase() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-(--surface-muted)/50 py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 text-center"
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-(--brand) uppercase">
            Explore by category
          </p>
          <h2 className="font-heading mt-2 text-3xl font-semibold text-(--text-primary) sm:text-4xl">
            Wedding Service Categories
          </h2>
          <p className="muted-text mx-auto mt-3 max-w-xl text-sm">
            Find exactly what you need for your big day. Pick a category to see
            the services available.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3">
          {FEATURED_CATEGORIES.map((category, index) => {
            const Icon = ICONS[category.icon] ?? Sparkles;

            return (
              <motion.div
                key={category.label}
                initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: "easeOut",
                }}
              >
              <Card
                role="button"
                tabIndex={0}
                onClick={() =>
                  router.push(
                    `/services?category=${encodeURIComponent(category.query)}`
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(
                      `/services?category=${encodeURIComponent(category.query)}`
                    );
                  }
                }}
                className="theme-card group flex cursor-pointer flex-col items-start gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-(--brand)/40 hover:shadow-md sm:p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand)">
                  <Icon size={21} />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-(--text-primary)">
                    {category.label}
                  </h3>
                  <p className="muted-text mt-1 text-xs">{category.description}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-(--brand)">
                  Explore <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
