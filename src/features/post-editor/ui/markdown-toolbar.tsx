"use client";

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

interface ToolbarButtonProps {
  label: string;
  title: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  disabled?: boolean;
}

function ToolbarButton({
  label,
  title,
  onClick,
  bold,
  italic,
  strikethrough,
  disabled,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs text-text-2 transition-colors hover:bg-background-3 hover:text-text-1 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        className={[
          bold ? "font-bold" : "",
          italic ? "italic" : "",
          strikethrough ? "line-through" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1 h-4 w-px bg-border-3" aria-hidden="true" />;
}

interface MarkdownToolbarProps {
  editorView: EditorView | null;
}

export function MarkdownToolbar({ editorView }: MarkdownToolbarProps) {
  const isReady = editorView !== null;

  const withView = (fn: (view: EditorView) => void) => () => {
    if (editorView) fn(editorView);
  };

  return (
    <div
      role="toolbar"
      aria-label="마크다운 서식 툴바"
      className="flex flex-wrap items-center gap-0.5 rounded-t-[1.25rem] border border-b-0 border-border-3 bg-background-2 px-2 py-1.5"
    >
      {/* 텍스트 서식 */}
      <ToolbarButton
        label="B"
        title="볼드 (Ctrl+B)"
        bold
        disabled={!isReady}
        onClick={withView((view) => wrapSelection(view, "**", "**"))}
      />
      <ToolbarButton
        label="I"
        title="이탤릭 (Ctrl+I)"
        italic
        disabled={!isReady}
        onClick={withView((view) => wrapSelection(view, "*", "*"))}
      />
      <ToolbarButton
        label="S"
        title="취소선"
        strikethrough
        disabled={!isReady}
        onClick={withView((view) => wrapSelection(view, "~~", "~~"))}
      />

      <ToolbarSeparator />

      {/* 헤딩 */}
      <ToolbarButton
        label="H1"
        title="제목 1"
        bold
        disabled={!isReady}
        onClick={withView((view) => toggleLinePrefix(view, "# "))}
      />
      <ToolbarButton
        label="H2"
        title="제목 2"
        bold
        disabled={!isReady}
        onClick={withView((view) => toggleLinePrefix(view, "## "))}
      />
      <ToolbarButton
        label="H3"
        title="제목 3"
        bold
        disabled={!isReady}
        onClick={withView((view) => toggleLinePrefix(view, "### "))}
      />

      <ToolbarSeparator />

      {/* 링크 & 이미지 */}
      <ToolbarButton
        label="링크"
        title="링크 (Ctrl+K)"
        disabled={!isReady}
        onClick={withView((view) => insertLink(view))}
      />
      <ToolbarButton
        label="이미지"
        title="이미지 삽입"
        disabled={!isReady}
        onClick={withView((view) => insertImageTemplate(view))}
      />

      <ToolbarSeparator />

      {/* 코드 */}
      <ToolbarButton
        label="<>"
        title="인라인 코드"
        disabled={!isReady}
        onClick={withView((view) => wrapSelection(view, "`", "`"))}
      />
      <ToolbarButton
        label="</>"
        title="코드 블록"
        disabled={!isReady}
        onClick={withView((view) => insertCodeBlock(view))}
      />

      <ToolbarSeparator />

      {/* 블록 요소 */}
      <ToolbarButton
        label="인용"
        title="인용"
        disabled={!isReady}
        onClick={withView((view) => toggleLinePrefix(view, "> "))}
      />
      <ToolbarButton
        label="1."
        title="순서 목록"
        disabled={!isReady}
        onClick={withView((view) => toggleLinePrefix(view, "1. "))}
      />
      <ToolbarButton
        label="-"
        title="비순서 목록"
        disabled={!isReady}
        onClick={withView((view) => toggleLinePrefix(view, "- "))}
      />

      <ToolbarSeparator />

      {/* 특수 요소 */}
      <ToolbarButton
        label="──"
        title="구분선"
        disabled={!isReady}
        onClick={withView((view) => insertHorizontalRule(view))}
      />
      <ToolbarButton
        label="표"
        title="테이블 삽입"
        disabled={!isReady}
        onClick={withView((view) => insertTable(view))}
      />
    </div>
  );
}
