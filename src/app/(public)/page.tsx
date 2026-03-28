import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCanonicalMetadata, getSiteDescription } from "@shared/lib/seo";
import { buildWebSiteJsonLd, getSiteUrl } from "@shared/lib/structured-data";
import { JsonLd } from "@shared/ui/json-ld";
import { HomePage } from "@widgets/home-page";

interface PageProps {
  searchParams?: {
    page?: string | string[];
  };
}

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string) {
  if (value === undefined) {
    return 1;
  }

  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    notFound();
  }

  return page;
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const rawPage = getSingleValue(searchParams?.page);
  const page = rawPage === undefined ? 1 : parsePage(rawPage);

  return {
    description: getSiteDescription(),
    ...buildCanonicalMetadata("/", { page }),
  };
}

export default function Page({ searchParams }: PageProps) {
  const siteUrl = getSiteUrl();

  return (
    <>
      {siteUrl ? <JsonLd data={buildWebSiteJsonLd(siteUrl)} /> : null}
      <HomePage searchParams={searchParams} />
    </>
  );
}
