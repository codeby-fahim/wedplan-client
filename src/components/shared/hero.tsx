"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Camera,
  Flower2,
  HeartHandshake,
  MapPin,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

function AvatarStack() {
  const people = ["A", "R", "S"];
  const tones = [
    "bg-[var(--brand)]",
    "bg-[var(--brand)]/70",
    "bg-[var(--brand)]/40",
  ];

  return (
    <div className="flex -space-x-2.5">
      {people.map((person, index) => (
        <span
          key={person}
          className={`flex size-9 items-center justify-center rounded-full border-2 border-[var(--surface)] text-xs font-semibold text-white ${tones[index]}`}
          aria-hidden="true"
        >
          {person}
        </span>
      ))}
    </div>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay, ease: EASE },
        };

  const floatIn = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28, scale: 0.96 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="relative isolate overflow-hidden bg-[var(--page-background)]">
      {/* Soft brand glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -left-40 size-[32rem] rounded-full bg-(--brand)/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 -bottom-56 size-[34rem] rounded-full bg-(--brand)/10 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:py-24">
        {/* Copy */}
        <div className="max-w-xl text-center lg:text-left">
          <motion.div {...rise(0)} className="flex justify-center lg:justify-start">
            <Badge
              variant="outline"
              className="gap-1.5 border-(--brand)/25 bg-(--brand-soft) px-3 py-1 text-(--brand)"
            >
              <HeartHandshake />
              Wedding planning, made beautiful
            </Badge>
          </motion.div>

          <motion.h1
            {...rise(0.1)}
            className="font-heading mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-(--text-primary) sm:text-5xl lg:text-[3.4rem] xl:text-6xl"
          >
            Your perfect day starts with the{" "}
            <span className="text-(--brand)">right people.</span>
          </motion.h1>

          <motion.p
            {...rise(0.2)}
            className="muted-text mx-auto mt-6 max-w-lg text-base leading-relaxed sm:text-lg lg:mx-0"
          >
            Discover trusted wedding vendors, compare services, and bring your
            vision to life — all in one calm, elegant place.
          </motion.p>

          <motion.div
            {...rise(0.3)}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button
              size="lg"
              render={<Link href="/services" />}
              className="h-12 w-full rounded-full bg-(--brand) px-7 text-(--brand-foreground) shadow-md transition-all duration-200 hover:bg-(--brand-hover) hover:shadow-lg sm:w-auto"
            >
              Browse Services
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/sign-up" />}
              className="h-12 w-full rounded-full border-(--brand) px-7 text-(--brand) hover:bg-(--brand-soft) sm:w-auto"
            >
              Start planning
            </Button>
          </motion.div>

          <motion.div
            {...rise(0.4)}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
          >
            <AvatarStack />
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center gap-1 text-(--brand) sm:justify-start">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
                <span className="ml-1 text-xs font-semibold text-(--text-primary)">
                  4.9/5
                </span>
              </div>
              <p className="muted-text mt-1 text-xs">
                Loved by couples and vendors alike
              </p>
            </div>
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          {...floatIn(0.25)}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="relative rounded-[2rem] border border-(--brand)/15 bg-(--surface) p-3 shadow-[0_30px_80px_-35px_rgba(0,0,0,0.35)]">
            <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_25%_15%,var(--brand-soft),var(--surface-muted))] sm:h-80 lg:h-[26rem]">
              <motion.div
                animate={
                  reduceMotion ? undefined : { y: [0, -12, 0], rotate: [0, 2, 0] }
                }
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/logo.png"
                  alt="A couple in love, illustrated inside a heart"
                  width={220}
                  height={220}
                  priority
                  className="h-40 w-40 rounded-full object-contain drop-shadow-xl sm:h-56 sm:w-56"
                />
              </motion.div>

              <div className="absolute bottom-4 left-4 rounded-xl border border-(--brand)/10 bg-(--surface)/90 px-4 py-2 shadow-sm backdrop-blur sm:bottom-6 sm:left-6">
                <p className="muted-text text-[10px] font-medium tracking-wide uppercase">
                  Curated for you
                </p>
                <p className="font-heading text-sm font-semibold text-(--text-primary) sm:text-base">
                  A day to remember
                </p>
              </div>
            </div>
          </div>

          {/* Floating detail cards */}
          <motion.div
            {...floatIn(0.5)}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            className="absolute -top-4 -left-2 flex items-center gap-2.5 rounded-2xl border border-(--brand)/15 bg-(--surface) px-3.5 py-2.5 shadow-lg sm:-left-8 sm:px-4 sm:py-3"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand)">
              <MapPin size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-(--text-primary)">
                Dream venues
              </p>
              <p className="muted-text text-[11px]">120+ verified spaces</p>
            </div>
          </motion.div>

          <motion.div
            {...floatIn(0.6)}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            className="absolute -right-2 -bottom-4 flex items-center gap-2.5 rounded-2xl border border-(--brand)/15 bg-(--surface) px-3.5 py-2.5 shadow-lg sm:-right-6 sm:px-4 sm:py-3"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand)">
              <Camera size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-(--text-primary)">
                Photographers
              </p>
              <p className="muted-text text-[11px]">Rated 4.9 by couples</p>
            </div>
          </motion.div>

          <motion.div
            {...floatIn(0.7)}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            className="absolute right-3 -top-5 hidden items-center gap-2 rounded-2xl border border-(--brand)/15 bg-(--surface) px-3.5 py-2.5 shadow-lg sm:flex"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand)">
              <Flower2 size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-(--text-primary)">
                Florals &amp; decor
              </p>
              <p className="muted-text text-[11px]">Made just for you</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
