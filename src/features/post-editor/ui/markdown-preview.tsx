"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { renderMarkdown } from "@shared/lib/markdown";
import { cn } from "@shared/lib/style-utils";

interface MarkdownPreviewProps {
  value: string;
  containerRef?: RefObject<HTMLDivElement>;
  className?: string;
  headerTitle?: string;
}

export function MarkdownPreview({
  value,
  containerRef,
  className,
  headerTitle = "Preview",
}: MarkdownPreviewProps) {
  const [html, setHtml] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setIsRendering(true);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    void renderMarkdown(value)
      .then((nextHtml) => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setHtml(nextHtml);
        setError(null);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError("미리보기를 렌더링할 수 없습니다.");
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsRendering(false);
        }
      });
  }, [value]);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-background-1",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border-3 bg-background-2 px-4 py-3 text-xs font-medium text-text-4">
        <span>{headerTitle}</span>
        <span>{isRendering ? "렌더링 중" : "실시간 반영"}</span>
      </div>

      {error ? (
        <div className="p-6 text-sm text-negative-1">{error}</div>
      ) : (
        <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto">
          <div
            className="markdown-content prose max-w-none px-6 py-5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}
