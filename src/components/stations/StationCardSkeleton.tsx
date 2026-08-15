export function StationCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="skeleton mb-2 h-4 w-2/3" />
          <div className="skeleton mb-1 h-3 w-11/12" />
          <div className="skeleton h-3 w-1/3" />
        </div>
        <div className="skeleton h-8 w-16 shrink-0" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="skeleton h-4 w-14" />
        <div className="skeleton h-4 w-14" />
      </div>
    </div>
  )
}