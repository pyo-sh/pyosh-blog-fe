import { Skeleton } from "@shared/ui/libs";

const placeholderItems = Array.from({ length: 5 }, (_, index) => index);

export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex min-h-[100dvh] w-full max-w-[67.5rem] flex-col gap-8 px-4 pb-16 pt-8 md:px-6"
    >
      <div className="motion-reveal rounded-[2rem] border border-border-3 bg-background-2/90 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.06)] md:p-8">
        <div className="space-y-3">
          <Skeleton height="1rem" width="7rem" />
          <Skeleton
            height="2.5rem"
            className="max-w-[20rem] rounded-[1rem]"
            tone="strong"
          />
          <Skeleton
            height="1rem"
            className="max-w-[32rem] rounded-full"
            repeat={2}
          />
        </div>
      </div>

      <ul className="space-y-4">
        {placeholderItems.map((item) => (
          <li
            key={item}
            className="rounded-[1.5rem] border border-border-3 bg-background-2/90 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)] sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <Skeleton height="1.5rem" width="5rem" className="rounded-md" />
              <Skeleton height="0.875rem" width="4.5rem" />
            </div>
            <div className="mb-3">
              <Skeleton
                height="1.75rem"
                className="max-w-[26rem] rounded-[0.875rem]"
                tone="strong"
              />
            </div>
            <div className="space-y-2">
              <Skeleton repeat={2} />
              <Skeleton width="70%" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
