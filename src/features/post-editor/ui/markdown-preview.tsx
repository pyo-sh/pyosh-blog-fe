"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@shared/lib/style-utils";

interface MarkdownPreviewProps {
  value: string;
  containerRef?: RefObject<HTMLDivElement>;
  className?: string;
  headerTitle?: string;
  showHeader?: boolean;
}

export function MarkdownPreview({
  value,
  containerRef,
  className,
  headerTitle = "Preview",
  showHeader = true,
}: MarkdownPreviewProps) {
  const [html, setHtml] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const latestValueRef = useRef(value);
  const skipNextValueEffectRef = useRef(true);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

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
    setIsRendering(true);
    requestIdRef.current = 1;
    worker.postMessage({
      id: requestIdRef.current,
      value: latestValueRef.current,
    });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (workerRef.current === null) {
      return;
    }

    if (skipNextValueEffectRef.current) {
      skipNextValueEffectRef.current = false;

      return;
    }

    setIsRendering(true);

    const timeoutId = window.setTimeout(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      workerRef.current?.postMessage({ id: requestId, value });
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-background-1",
        className,
      )}
    >
      {showHeader ? (
        <div className="flex items-center justify-between border-b border-border-3 bg-background-2 px-4 py-3 text-xs font-medium text-text-4">
          <span>{headerTitle}</span>
          <span>{isRendering ? "렌더링 중" : "실시간 반영"}</span>
        </div>
      ) : null}

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
