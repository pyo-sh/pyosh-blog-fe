"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import {
  insertCodeBlock,
  insertHorizontalRule,
  insertImageTemplate,
  insertLink,
  insertTable,
  toggleLinePrefix,
  wrapSelection,
} from "../lib/markdown-commands";
import type { EditorView } from "@codemirror/view";

interface ButtonDef {
  label: string;
  title: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  action: (view: EditorView) => void;
}

type ToolbarItem = ButtonDef | "separator";

function buildToolbarItems(): ToolbarItem[] {
  const btn = (def: ButtonDef): ButtonDef => def;

  return [
    btn({
      label: "B",
      title: "볼드 (Ctrl+B)",
      bold: true,
      action: (v) => wrapSelection(v, "**", "**"),
    }),
    btn({
      label: "I",
      title: "이탤릭 (Ctrl+I)",
      italic: true,
      action: (v) => wrapSelection(v, "*", "*"),
    }),
    btn({
      label: "S",
      title: "취소선",
      strikethrough: true,
      action: (v) => wrapSelection(v, "~~", "~~"),
    }),
    "separator",
    btn({
      label: "H1",
      title: "제목 1",
      bold: true,
      action: (v) => toggleLinePrefix(v, "# "),
    }),
    btn({
      label: "H2",
      title: "제목 2",
      bold: true,
      action: (v) => toggleLinePrefix(v, "## "),
    }),
    btn({
      label: "H3",
      title: "제목 3",
      bold: true,
      action: (v) => toggleLinePrefix(v, "### "),
    }),
    "separator",
    btn({
      label: "링크",
      title: "링크 (Ctrl+K)",
      action: (v) => insertLink(v),
    }),
    btn({
      label: "이미지",
      title: "이미지 삽입",
      action: (v) => insertImageTemplate(v),
    }),
    "separator",
    btn({
      label: "<>",
      title: "인라인 코드",
      action: (v) => wrapSelection(v, "`", "`"),
    }),
    btn({
      label: "</>",
      title: "코드 블록",
      action: (v) => insertCodeBlock(v),
    }),
    "separator",
    btn({
      label: "인용",
      title: "인용",
      action: (v) => toggleLinePrefix(v, "> "),
    }),
    btn({
      label: "1.",
      title: "순서 목록",
      action: (v) => toggleLinePrefix(v, "1. "),
    }),
    btn({
      label: "-",
      title: "비순서 목록",
      action: (v) => toggleLinePrefix(v, "- "),
    }),
    "separator",
    btn({
      label: "──",
      title: "구분선",
      action: (v) => insertHorizontalRule(v),
    }),
    btn({ label: "표", title: "테이블 삽입", action: (v) => insertTable(v) }),
  ];
}

interface MarkdownToolbarProps {
  editorView: EditorView | null;
}

export function MarkdownToolbar({ editorView }: MarkdownToolbarProps) {
  const isReady = editorView !== null;
  const items = buildToolbarItems();
  const buttons = items.filter(
    (item): item is ButtonDef => item !== "separator",
  );
  const [focusedIdx, setFocusedIdx] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (focusedIdx + delta + buttons.length) % buttons.length;

    setFocusedIdx(next);
    buttonRefs.current[next]?.focus();
  };

  let buttonIndex = -1;

  return (
    <div
      role="toolbar"
      aria-label="마크다운 서식 툴바"
      onKeyDown={handleKeyDown}
      className="flex flex-wrap items-center gap-0.5 rounded-t-[1.25rem] border border-b-0 border-border-3 bg-background-2 px-2 py-1.5"
    >
      {items.map((item, itemIdx) => {
        if (item === "separator") {
          return (
            <div
              key={`sep-${itemIdx}`}
              className="mx-1 h-4 w-px bg-border-3"
              aria-hidden="true"
            />
          );
        }

        buttonIndex += 1;
        const idx = buttonIndex;

        return (
          <button
            key={item.title}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            title={item.title}
            aria-label={item.title}
            disabled={!isReady}
            tabIndex={idx === focusedIdx ? 0 : -1}
            onFocus={() => setFocusedIdx(idx)}
            onClick={() => {
              if (editorView) item.action(editorView);
            }}
            className="flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs text-text-2 transition-colors hover:bg-background-3 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span
              className={[
                item.bold ? "font-bold" : "",
                item.italic ? "italic" : "",
                item.strikethrough ? "line-through" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
