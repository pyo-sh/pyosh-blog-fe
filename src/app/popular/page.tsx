import { redirect } from "next/navigation";
import { PopularPageContent } from "./popular-page-content";
import { fetchPopularPosts } from "@entities/stat";

export const dynamic = "force-dynamic";

const DEFAULT_DAYS = 7;
const VALID_DAYS = new Set([7, 30]);

interface PopularPageProps {
  searchParams?: {
    days?: string | string[];
  };
}

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDays(value?: string): 7 | 30 {
  if (value === undefined) {
    redirect(`/popular?days=${DEFAULT_DAYS}`);
  }

  const days = Number(value);

  if (!Number.isInteger(days) || !VALID_DAYS.has(days)) {
    redirect(`/popular?days=${DEFAULT_DAYS}`);
  }

  return days as 7 | 30;
}

export default async function PopularPage({ searchParams }: PopularPageProps) {
  const days = parseDays(getSingleValue(searchParams?.days));
  const posts = await fetchPopularPosts(days);

  return <PopularPageContent days={days} posts={posts} />;
}
