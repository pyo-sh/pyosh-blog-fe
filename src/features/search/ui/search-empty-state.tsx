import { Icon } from "@iconify/react";
import magniferZoomInLinear from "@iconify-icons/solar/magnifer-zoom-in-linear";

interface SearchEmptyStateProps {
  title: string;
  description: string;
}

export function SearchEmptyState({
  title,
  description,
}: SearchEmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 text-text-4">
        <Icon icon={magniferZoomInLinear} width="48" aria-hidden="true" />
      </div>
      <h2 className="text-ui-base font-semibold text-text-2">{title}</h2>
      <p className="mt-1 text-body-sm text-text-4">{description}</p>
    </section>
  );
}
