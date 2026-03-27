import { buildWebSiteJsonLd, getSiteUrl } from "@shared/lib/structured-data";
import { JsonLd } from "@shared/ui/json-ld";
import { HomePage } from "@widgets/home-page";

interface PageProps {
  searchParams?: {
    page?: string | string[];
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
