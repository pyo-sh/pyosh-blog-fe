import { Skeleton } from "@shared/ui/libs";

const placeholderItems = Array.from({ length: 5 }, (_, index) => index);

export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex min-h-screen w-full max-w-[67.5rem] flex-col gap-6 px-6 py-16"
    >
      <div className="space-y-3">
        <Skeleton height="1.25rem" width="8rem" />
        <Skeleton height="2.5rem" className="max-w-[32rem] rounded-[1.25rem]" />
      </div>

      <ul className="space-y-4">
        {placeholderItems.map((item) => (
          <li
            key={item}
            className="rounded-[1.5rem] border border-border-3 bg-background-2 p-6"
          >
            <div className="mb-4">
              <Skeleton height="1.5rem" width="6rem" />
            </div>
            <div className="mb-3">
              <Skeleton height="2rem" className="max-w-[26rem]" />
            </div>
            <Skeleton repeat={3} />
          </li>
        ))}
      </ul>
    </main>
  );
}
