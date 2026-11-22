import type { Metadata } from "next";
import { CalendarCheck, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

import AuthRedirectGuard from "@/components/shared/auth-redirect-guard";
import SignUpForm from "@/components/shared/sign-up-form";

// Reads searchParams on the server; allow this route to block at prerender time.
export const instant = false;

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your WedPlan account as a vendor or customer and start planning the perfect wedding.",
};

type SignUpPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const highlights = [
  {
    icon: Sparkles,
    title: "Discover curated vendors",
    text: "Browse trusted photographers, venues, florists and more.",
  },
  {
    icon: CalendarCheck,
    title: "Manage every booking",
    text: "Keep requests, quotes and schedules in one calm place.",
  },
  {
    icon: ShieldCheck,
    title: "Built for everyone",
    text: "Customers plan freely while vendors grow their business.",
  },
];

const SignUpPage = async ({ searchParams }: SignUpPageProps) => {
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:py-14">
      <AuthRedirectGuard />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 size-112 rounded-full bg-(--brand)/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-40 size-112 rounded-full bg-(--brand)/10 blur-3xl"
      />

      <div className="relative grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--brand)/25 bg-(--brand-soft) px-3 py-1 text-xs font-medium text-(--brand)">
            <HeartHandshake size={14} />
            Your dream day starts here
          </div>

          <h1 className="font-heading text-4xl leading-[1.15] font-semibold tracking-tight text-(--text-primary) xl:text-5xl">
            Plan the day you&apos;ll{" "}
            <span className="text-(--brand)">remember forever.</span>
          </h1>

          <p className="muted-text mt-5 max-w-md text-base leading-relaxed">
            WedPlan brings couples and the wedding professionals they love into
            one beautiful, simple place. Create your free account to get
            started.
          </p>

          <ul className="mt-9 space-y-5">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-(--brand)/20 bg-(--surface) text-(--brand) shadow-sm">
                  <Icon size={19} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">
                    {title}
                  </p>
                  <p className="muted-text mt-0.5 text-sm">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="w-full">
          <SignUpForm oauthError={error} />
        </div>
      </div>
    </main>
  );
};

export default SignUpPage;
