import { HomePage } from "@widgets/home-page";

interface PageProps {
  searchParams?: {
    page?: string | string[];
  };
}

export default function Page({ searchParams }: PageProps) {
  return <HomePage searchParams={searchParams} />;
}
