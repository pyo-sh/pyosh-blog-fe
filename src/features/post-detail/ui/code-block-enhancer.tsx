"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";

function createCodeHeader(
  lang: string | undefined,
  pre: HTMLElement,
  timers: Array<ReturnType<typeof setTimeout>>,
): HTMLDivElement {
  const header = document.createElement("div");
  header.className =
    "flex items-center justify-between px-4 py-2 border-b border-border-3";

  const langLabel = document.createElement("span");
  langLabel.className = "text-body-xs text-text-4";
  langLabel.textContent = lang ?? "";
  header.appendChild(langLabel);

  const copyBtn = document.createElement("button");
  copyBtn.className =
    "text-body-xs text-text-4 transition-colors hover:text-text-2";
  copyBtn.textContent = "복사";
  copyBtn.setAttribute("aria-label", "코드 복사");
  copyBtn.setAttribute("type", "button");

  if (!navigator.clipboard) {
    copyBtn.style.display = "none";
  } else {
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    copyBtn.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      const text = code?.textContent ?? "";

      try {
        await navigator.clipboard.writeText(text);
        if (resetTimer !== null) {
          clearTimeout(resetTimer);
          const idx = timers.indexOf(resetTimer);
          if (idx !== -1) timers.splice(idx, 1);
        }
        copyBtn.textContent = "복사됨";
        resetTimer = setTimeout(() => {
          resetTimer = null;
          copyBtn.textContent = "복사";
        }, 1500);
        timers.push(resetTimer);
      } catch {
        // clipboard write failed — leave button as-is
      }
    });
  }

  header.appendChild(copyBtn);

  return header;
}

export function CodeBlockEnhancer({ children }: PropsWithChildren) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timers: Array<ReturnType<typeof setTimeout>> = [];

    const preBlocks = container.querySelectorAll<HTMLElement>("pre");
    preBlocks.forEach((pre) => {
      // 이미 래퍼가 삽입된 경우 중복 삽입 방지
      if (pre.parentElement?.hasAttribute("data-code-wrapper")) return;

      const code = pre.querySelector("code");
      // [^\s]+ captures language names with special chars (c++, c#, objective-c)
      const lang = code?.className?.match(/language-([^\s]+)/)?.[1];

      const header = createCodeHeader(lang, pre, timers);

      // pre를 wrapper로 감싸서 헤더가 가로 스크롤 밖에 고정되도록 함
      // 시각 스타일(bg/border/radius)은 typography.css의 [data-code-wrapper]에서 관리
      if (!pre.parentNode) return;
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-wrapper", "true");
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
