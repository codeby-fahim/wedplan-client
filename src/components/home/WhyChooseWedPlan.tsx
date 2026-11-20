"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Star,
  Zap,
  Heart,
  Users,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Verified & Trusted Vendors",
    description:
      "Every vendor on WedPlan is vetted for quality, reliability, and professionalism — so you can book with confidence.",
  },
  {
    icon: Star,
    title: "Top-Rated Services",
    description:
      "Browse services rated by real couples. Transparent reviews help you pick the perfect fit for your big day.",
  },
  {
    icon: Zap,
    title: "Effortless Planning",
    description:
      "Compare packages, check availability, and request bookings in just a few clicks — no phone tag required.",
  },
  {
    icon: Heart,
    title: "Personalized Experience",
    description:
      "Get curated recommendations based on your style, budget, and wedding vision. Your day, your way.",
  },
  {
    icon: Users,
    title: "Direct Vendor Communication",
    description:
      "Connect directly with vendors, discuss your requirements, and negotiate details — all within the platform.",
  },
  {
    icon: Clock,
    title: "Save Time & Stress",
    description:
      "No more endless tabs and spreadsheets. WedPlan brings everything together so you can enjoy the journey.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: EASE },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WhyChooseWedPlan() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-(--page-background) py-20 sm:py-28 lg:py-32">
      {/* Decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-144 -translate-x-1/2 rounded-full bg-(--brand)/6 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        {/* ---- Section header ---- */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-(--brand)/20 bg-(--brand-soft) px-4 py-1.5 text-xs font-medium tracking-wide text-(--brand) sm:text-sm"
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Heart size={14} fill="currentColor" />
            Why Couples Love Us
          </motion.span>

          <motion.h2
            className="font-heading mt-5 text-3xl font-bold tracking-tight text-(--text-primary) sm:text-4xl lg:text-5xl"
            initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            Why Choose{" "}
            <span className="text-(--brand)">WedPlan?</span>
          </motion.h2>

          <motion.p
            className="muted-text mt-4 text-base leading-relaxed sm:text-lg"
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          >
            Everything you need to plan your dream wedding — from discovering
            the best vendors to managing every detail in one beautiful place.
          </motion.p>
        </div>

        {/* ---- Benefit cards grid ---- */}
        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                custom={i}
                variants={reduceMotion ? undefined : cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                className="group relative rounded-2xl border border-(--brand)/10 bg-(--surface) p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:p-8"
              >
                {/* Icon */}
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand) transition-colors duration-300 group-hover:bg-(--brand) group-hover:text-white">
                  <Icon size={22} strokeWidth={1.8} />
                </span>

                {/* Text */}
                <h3 className="font-heading mt-5 text-lg font-semibold text-(--text-primary)">
                  {benefit.title}
                </h3>
                <p className="muted-text mt-2 text-sm leading-relaxed">
                  {benefit.description}
                </p>

                {/* Subtle corner accent */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-4 size-16 rounded-full bg-(--brand)/4 blur-2xl transition-all duration-500 group-hover:bg-(--brand)/10"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
