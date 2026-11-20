import type { ReactNode } from "react";

export default function DashboardPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-(--text-primary) sm:text-3xl">
          {title}
        </h1>
        <p className="muted-text mt-1.5 text-sm">{description}</p>
      </div>

      {children ?? (
        <div className="theme-card p-6 sm:p-8">
          <p className="muted-text text-sm">
            This section is ready to be built.
          </p>
        </div>
      )}
    </div>
  );
}
