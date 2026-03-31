"use client";

import { useEffect } from "react";
import { ErrorContent } from "@shared/ui/libs";

type DashboardErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({
  error,
  reset,
}: DashboardErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <ErrorContent
        badge="500 Server Error"
        badgeVariant="negative"
        title="문제가 발생했습니다"
        description="페이지를 불러오는 중 예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        action={{ type: "button", onClick: reset, label: "다시 시도" }}
        context="admin"
        eyebrow="Admin Status"
      />
    </div>
  );
}
