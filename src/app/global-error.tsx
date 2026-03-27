"use client";

import { useEffect } from "react";
import "@app-layer/style/index.css";
import { ErrorContent } from "@shared/ui/libs";

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
        <main className="flex min-h-[100dvh] items-center justify-center bg-background-1 px-6 py-16 text-text-1">
          <ErrorContent
            badge="500 Server Error"
            badgeVariant="negative"
            title="문제가 발생했습니다"
            description="앱을 초기화하는 중 예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
            action={{ type: "button", onClick: reset, label: "다시 시도" }}
          />
        </main>
      </body>
    </html>
  );
}
