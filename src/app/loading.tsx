export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-(--surface-muted)" />
          <div className="h-9 w-2/3 max-w-md animate-pulse rounded bg-(--surface-muted)" />
          <div className="h-4 w-1/2 max-w-sm animate-pulse rounded bg-(--surface-muted)" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="theme-card h-64 animate-pulse" />
          ))}
        </div>
        <p className="muted-text text-center text-xs" role="status" aria-live="polite">
          Loading WedPlan...
        </p>
      </div>
    </main>
  );
}
