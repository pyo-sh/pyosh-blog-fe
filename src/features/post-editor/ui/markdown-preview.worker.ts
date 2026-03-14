/// <reference lib="webworker" />

import { renderMarkdown } from "@shared/lib/markdown";

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent<{ id: number; value: string }>) => {
  const { id, value } = event.data;

  try {
    const html = await renderMarkdown(value);

    self.postMessage({ id, html });
  } catch {
    self.postMessage({
      id,
      error: "미리보기를 렌더링할 수 없습니다.",
    });
  }
};

export {};
