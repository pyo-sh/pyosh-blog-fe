"use client";

import { useEffect, useState } from "react";
import { renderMarkdown } from "@shared/lib/markdown";

interface MarkdownPreviewProps {
  value: string;
}

export function MarkdownPreview({ value }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    setIsRendering(true);

    const timeoutId = window.setTimeout(() => {
      void renderMarkdown(value)
        .then((nextHtml) => {
          if (!isActive) {
            return;
          }

          setHtml(nextHtml);
          setError(null);
        })
        .catch(() => {
          if (!isActive) {
            return;
          }

          setError("미리보기를 렌더링할 수 없습니다.");
        })
        .finally(() => {
          if (isActive) {
            setIsRendering(false);
          }
        });
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  return (
    <div className="relative min-h-[60vh] overflow-hidden rounded-[1.25rem] border border-border-3 bg-background-1">
      <div className="flex items-center justify-between border-b border-border-3 px-4 py-3 text-xs uppercase tracking-[0.2em] text-text-4">
        <span>Preview</span>
        <span>{isRendering ? "렌더링 중" : "실시간 반영"}</span>
      </div>

      {error ? (
        <div className="p-6 text-sm text-negative-1">{error}</div>
      ) : (
        <div
          className="markdown-content prose max-w-none px-4 py-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
