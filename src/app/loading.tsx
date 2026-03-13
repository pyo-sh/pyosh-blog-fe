const placeholderItems = Array.from({ length: 5 }, (_, index) => index);

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-6 px-6 py-16">
      <div className="space-y-3">
        <div className="h-5 w-32 animate-pulse rounded-full bg-background-3" />
        <div className="h-10 w-full max-w-[32rem] animate-pulse rounded-[1.25rem] bg-background-3" />
      </div>

      <ul className="space-y-4">
        {placeholderItems.map((item) => (
          <li
            key={item}
            className="animate-pulse rounded-[1.5rem] border border-border-3 bg-background-2 p-6"
          >
            <div className="mb-4 h-6 w-24 rounded-full bg-background-4" />
            <div className="mb-3 h-8 w-full max-w-[26rem] rounded-full bg-background-4" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded-full bg-background-4" />
              <div className="h-4 w-[92%] rounded-full bg-background-4" />
              <div className="h-4 w-[78%] rounded-full bg-background-4" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
