"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Animation presets                                                  */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

function rise(delay: number, reduce: boolean | null) {
  return reduce
    ? {}
    : {
        initial: { opacity: 0, y: 32 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay, ease: EASE },
      };
}

function fadeScale(delay: number, reduce: boolean | null) {
  return reduce
    ? {}
    : {
        initial: { opacity: 0, scale: 1.08 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 1.2, delay, ease: EASE },
      };
}

/* ------------------------------------------------------------------ */
/*  Floating accent particles (decorative)                             */
/* ------------------------------------------------------------------ */

function FloatingParticles({ reduce }: { reduce: boolean | null }) {
  if (reduce) return null;

  const particles = [
    { icon: Heart, x: "10%", y: "20%", delay: 0, size: 16 },
    { icon: Sparkles, x: "85%", y: "15%", delay: 0.5, size: 14 },
    { icon: Heart, x: "75%", y: "75%", delay: 1, size: 12 },
    { icon: Sparkles, x: "15%", y: "80%", delay: 1.5, size: 14 },
    { icon: Heart, x: "50%", y: "10%", delay: 0.8, size: 10 },
  ];

  return (
    <>
      {particles.map((p, i) => {
        const Icon = p.icon;
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute text-white/20"
            style={{ left: p.x, top: p.y }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          >
            <Icon size={p.size} />
          </motion.span>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero component                                                     */
/* ------------------------------------------------------------------ */

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  /* Parallax: image moves slower than scroll */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[92svh] items-center justify-center overflow-hidden sm:min-h-svh"
    >
      {/* ---- Background image (parallax) ---- */}
      <motion.div
        {...fadeScale(0, reduceMotion)}
        className="absolute inset-0 -z-20"
        style={reduceMotion ? undefined : { y: imgY }}
      >
        <Image
          src="/hero.jpg"
          alt="Elegant wedding ceremony with floral arch, draped fabric, and beautifully arranged tables"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:object-center"
          quality={90}
        />
      </motion.div>

      {/* ---- Dark gradient overlay for text legibility ---- */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-black/60 via-black/50 to-black/70"
      />

      {/* ---- Soft brand tint ---- */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-(--brand)/10 mix-blend-multiply"
      />

      {/* ---- Floating decorative particles ---- */}
      <FloatingParticles reduce={reduceMotion} />

      {/* ---- Content ---- */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-5 py-20 text-center sm:px-6 sm:py-24 lg:py-32">
        {/* Badge */}
        <motion.div {...rise(0.1, reduceMotion)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm sm:px-4 sm:text-sm">
            <Heart size={14} className="text-(--brand-soft)" fill="currentColor" />
            Your Dream Wedding Starts Here
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...rise(0.25, reduceMotion)}
          className="font-heading mt-5 text-[2rem] leading-[1.12] font-bold tracking-tight text-white sm:mt-7 sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Plan Your Perfect{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-linear-to-r from-(--brand-soft) via-white to-(--brand-soft) bg-clip-text text-transparent">
              Wedding Day
            </span>
            {/* Decorative underline */}
            <motion.span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-linear-to-r from-transparent via-(--brand-soft) to-transparent sm:-bottom-2 sm:h-1"
              initial={reduceMotion ? undefined : { scaleX: 0 }}
              animate={reduceMotion ? undefined : { scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            />
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          {...rise(0.4, reduceMotion)}
          className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-6 sm:text-lg md:text-xl"
        >
          Discover trusted wedding vendors, compare services, and bring your
          vision to life — all in one elegant, easy-to-use platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...rise(0.55, reduceMotion)}
          className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
        >
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/services" />}
            className="group h-12 w-full cursor-pointer rounded-full bg-(--brand) px-7 text-[15px] font-semibold text-white shadow-lg shadow-(--brand)/25 transition-all duration-300 hover:bg-(--brand-hover) hover:shadow-xl hover:shadow-(--brand)/30 sm:h-13 sm:w-auto sm:px-8 sm:text-base"
          >
            Explore Wedding Services
            <ArrowRight
              size={18}
              className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>

          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/sign-up" />}
            className="h-12 w-full cursor-pointer rounded-full border-white/30 bg-white/10 px-7 text-[15px] font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20 sm:h-13 sm:w-auto sm:px-8 sm:text-base"
          >
            Get Started Free
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          {...rise(0.7, reduceMotion)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/60 sm:mt-12 sm:gap-x-6 sm:gap-y-3 sm:text-sm"
        >
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-green-400" />
            500+ Verified Vendors
          </span>
          <span className="hidden h-4 w-px bg-white/20 sm:inline-block" />
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-green-400" />
            10,000+ Happy Couples
          </span>
          <span className="hidden h-4 w-px bg-white/20 sm:inline-block" />
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-green-400" />
            Trusted & Secure
          </span>
        </motion.div>
      </div>

      {/* ---- Scroll indicator (hidden on very small screens) ---- */}
      <motion.div
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 sm:block sm:bottom-10"
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.div
          className="flex h-9 w-5.5 items-start justify-center rounded-full border-2 border-white/30 p-1"
          aria-hidden="true"
        >
          <motion.span
            className="block size-1.5 rounded-full bg-white/70"
            animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
