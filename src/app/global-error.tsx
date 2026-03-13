"use client";

import { useEffect } from "react";
import { Button, Text } from "@shared/ui/libs";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background-1 px-6 py-16 text-text-1">
          <div className="w-full max-w-[32rem] rounded-[2rem] border border-negative-1/20 bg-background-2 p-8 text-center shadow-[0px_18px_60px_0px_rgba(0,0,0,0.08)]">
            <div className="mb-4 inline-flex rounded-full bg-negative-1/10 px-4 py-2 text-negative-1">
              <Text as="span" fontSize="body-sm" fontWeight="bold">
                Error
              </Text>
            </div>

            <Text
              as="h1"
              fontSize="h3"
              fontWeight="bold"
              className="mb-3 block"
            >
              문제가 발생했습니다
            </Text>

            <Text
              as="p"
              fontSize="body-base"
              className="mb-8 block text-text-2"
            >
              앱을 초기화하는 중 예기치 않은 오류가 발생했습니다. 잠시 후 다시
              시도해 주세요.
            </Text>

            <Button
              type="button"
              theme="error"
              className="min-w-32 px-6"
              onClick={reset}
            >
              다시 시도
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
