import { Icon } from "@iconify/react";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import magniferZoomInLinear from "@iconify-icons/solar/magnifer-zoom-in-linear";

interface SearchEmptyStateProps {
  icon: "search" | "search-zoom-in";
  title: string;
  description: string;
}

export function SearchEmptyState({
  icon,
  title,
  description,
}: SearchEmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 text-text-4">
        <Icon
          icon={icon === "search" ? magniferLinear : magniferZoomInLinear}
          width="48"
          aria-hidden="true"
        />
      </div>
      <h2 className="text-ui-base font-semibold text-text-2">{title}</h2>
      <p className="mt-1 text-body-sm text-text-4">{description}</p>
    </section>
  );
}
