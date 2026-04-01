"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
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
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const worker = new Worker(
      new URL("./markdown-preview.worker.ts", import.meta.url),
    );

    worker.onmessage = (
      event: MessageEvent<{ id: number; html?: string; error?: string }>,
    ) => {
      if (event.data.id !== requestIdRef.current) {
        return;
      }

      if (event.data.error) {
        setError(event.data.error);
      } else {
        setHtml(event.data.html ?? "");
        setError(null);
      }

      setIsRendering(false);
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (workerRef.current === null) {
      return;
    }

    setIsRendering(true);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const timeoutId = window.setTimeout(() => {
      workerRef.current?.postMessage({ id: requestId, value });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  return (
    <div
      className={cn(
        "relative flex min-h-[60vh] flex-col overflow-hidden rounded-[1.25rem] border border-border-3 bg-background-1",
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
