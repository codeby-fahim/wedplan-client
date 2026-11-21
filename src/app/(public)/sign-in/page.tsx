import type { Metadata } from "next";
import { CalendarCheck, HeartHandshake, Sparkles, Store } from "lucide-react";

import SignInForm from "@/components/shared/sign-in-form";

// Reads searchParams on the server; allow this route to block at prerender time.
export const instant = false;

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your WedPlan account to manage your wedding bookings and services.",
};

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const highlights = [
  {
    icon: CalendarCheck,
    title: "Pick up where you left off",
    text: "Your bookings, requests and preferences are waiting.",
  },
  {
    icon: Store,
    title: "Vendors, your dashboard awaits",
    text: "Manage published services and new requests in one place.",
  },
  {
    icon: Sparkles,
    title: "Customers, keep planning",
    text: "Save your favourites and connect with trusted vendors.",
  },
];

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 size-[28rem] rounded-full bg-(--brand)/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-40 size-[28rem] rounded-full bg-(--brand)/10 blur-3xl"
      />

      <div className="relative grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/25 bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium text-[var(--brand)]">
            <HeartHandshake size={14} />
            Welcome back to WedPlan
          </div>

          <h1 className="font-heading text-4xl leading-[1.15] font-semibold tracking-tight text-[var(--text-primary)] xl:text-5xl">
            Every great celebration{" "}
            <span className="text-[var(--brand)]">starts here.</span>
          </h1>

          <p className="muted-text mt-5 max-w-md text-base leading-relaxed">
            Sign in to continue shaping the day you&apos;ll remember forever —
            whether you&apos;re planning it or helping make it happen.
          </p>

          <ul className="mt-9 space-y-5">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--brand)]/20 bg-[var(--surface)] text-[var(--brand)] shadow-sm">
                  <Icon size={19} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {title}
                  </p>
                  <p className="muted-text mt-0.5 text-sm">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="w-full">
          <SignInForm oauthError={error} />
        </div>
      </div>
    </main>
  );
};

export default SignInPage;
