"use client";

import { motion, useReducedMotion } from "motion/react";
import { Search, CalendarCheck, PartyPopper } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Discover & Browse",
    description:
      "Explore hundreds of verified wedding vendors — photographers, florists, venues, caterers, and more. Filter by category, location, and budget to find your perfect match.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Compare & Book",
    description:
      "Review portfolios, read real couple reviews, and compare service packages side by side. When you're ready, send a booking request directly through the platform.",
  },
  {
    number: "03",
    icon: PartyPopper,
    title: "Celebrate Your Day",
    description:
      "With every detail handled and every vendor confirmed, relax and enjoy the wedding you've always dreamed of. WedPlan has your back from start to finish.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[var(--surface)] py-20 sm:py-28 lg:py-32">
      {/* Decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-1/4 size-[30rem] rounded-full bg-[var(--brand)]/[0.05] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 bottom-1/4 size-[30rem] rounded-full bg-[var(--brand)]/[0.05] blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        {/* ---- Section header ---- */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--brand)] sm:text-sm"
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Simple & Seamless
          </motion.span>

          <motion.h2
            className="font-heading mt-5 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl"
            initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            How{" "}
            <span className="text-[var(--brand)]">WedPlan</span>{" "}
            Works
          </motion.h2>

          <motion.p
            className="muted-text mt-4 text-base leading-relaxed sm:text-lg"
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          >
            Three simple steps to turn your wedding vision into reality.
          </motion.p>
        </div>

        {/* ---- Steps ---- */}
        <div className="relative mt-16 sm:mt-20">
          {/* Connecting line (desktop only) */}
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-[var(--brand)]/20 via-[var(--brand)]/10 to-transparent lg:left-0 lg:right-0 lg:top-[4.5rem] lg:mx-auto lg:block lg:h-px lg:w-full lg:translate-x-0 lg:bg-gradient-to-r"
            initial={reduceMotion ? undefined : { scaleX: 0, scaleY: 0 }}
            whileInView={
              reduceMotion
                ? undefined
                : { scaleX: 1, scaleY: 1 }
            }
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
          />

          <div className="grid gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  className="relative flex flex-col items-center text-center"
                  initial={
                    reduceMotion ? undefined : { opacity: 0, y: 40 }
                  }
                  whileInView={
                    reduceMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.15 + i * 0.15,
                    ease: EASE,
                  }}
                >
                  {/* Step number ring + icon */}
                  <div className="relative">
                    {/* Outer glow */}
                    <span
                      aria-hidden="true"
                      className="absolute -inset-3 rounded-full bg-[var(--brand)]/[0.08] blur-xl"
                    />

                    <motion.div
                      className="relative z-10 flex size-[5.5rem] items-center justify-center rounded-full border-2 border-[var(--brand)]/20 bg-[var(--surface)]"
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { scale: 1.08, borderColor: "var(--brand)" }
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <Icon
                        size={28}
                        strokeWidth={1.6}
                        className="text-[var(--brand)]"
                      />
                    </motion.div>

                    {/* Step number badge */}
                    <span className="absolute -right-1 -top-1 z-20 flex size-7 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-white shadow-md">
                      {step.number}
                    </span>
                  </div>

                  {/* Text */}
                  <h3 className="font-heading mt-6 text-xl font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="muted-text mt-3 max-w-sm text-sm leading-relaxed sm:text-base">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
