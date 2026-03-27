const dashboardCardPlaceholders = Array.from(
  { length: 5 },
  (_, index) => index,
);

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded-full bg-background-3" />
        <div className="h-9 w-48 animate-pulse rounded-[1rem] bg-background-3" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {dashboardCardPlaceholders.map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-[1.5rem] border border-border-3 bg-background-2 p-6"
          >
            <div className="mb-4 h-4 w-20 rounded-full bg-background-4" />
            <div className="mb-3 h-10 w-24 rounded-full bg-background-4" />
            <div className="h-4 w-full rounded-full bg-background-4" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-[1.5rem] border border-border-3 bg-background-2 p-6"
          >
            <div className="h-4 w-28 rounded-full bg-background-4" />
            <div className="mt-4 h-8 w-40 rounded-full bg-background-4" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((__, innerIndex) => (
                <div
                  key={innerIndex}
                  className="h-18 rounded-[1rem] bg-background-4"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
