import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your WedPlan account settings.",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-[var(--text-primary)]">
        Profile Settings
      </h1>
      <p className="muted-text mt-2">
        Your profile settings will live here.
      </p>
    </main>
  );
}
