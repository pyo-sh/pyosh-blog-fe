import Link from "next/link";
import { cn } from "@shared/lib/style-utils";
import { Text } from "@shared/ui/libs";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-[36rem] rounded-[2rem] border border-border-3 bg-background-2 p-8 text-center shadow-[0px_18px_60px_0px_rgba(0,0,0,0.08)]">
        <Text
          as="span"
          fontSize="body-sm"
          fontWeight="bold"
          className="mb-4 inline-block rounded-full bg-primary-1/10 px-4 py-2 text-primary-1"
        >
          404 Not Found
        </Text>

        <Text as="h1" fontSize="h2" fontWeight="bold" className="mb-3 block">
          페이지를 찾을 수 없습니다
        </Text>

        <Text as="p" fontSize="body-base" className="mb-8 block text-text-2">
          요청하신 페이지가 없거나 이동되었습니다. 홈으로 돌아가서 다른 글을
          확인해 주세요.
        </Text>

        <Link
          href="/"
          className={cn(
            "inline-flex items-center justify-center rounded-[3px] bg-primary-1 px-6 py-2 text-text-1 shadow-[0px_2px_7px_0px_rgba(0,0,0,0.26)]",
            "transition-all duration-300 hover:-translate-y-[7px]",
          )}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
