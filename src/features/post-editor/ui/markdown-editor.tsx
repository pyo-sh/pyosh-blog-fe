"use client";

import { useEffect, useRef, useState } from "react";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { search, searchKeymap } from "@codemirror/search";
import {
  Annotation,
  Compartment,
  EditorState,
  Transaction,
} from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as editorPlaceholder,
} from "@codemirror/view";
import { MarkdownToolbar } from "./markdown-toolbar";
import { markdownKeymap } from "../lib/markdown-commands";
import { cn } from "@shared/lib/style-utils";

const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--color-background-1)",
    color: "var(--color-text-1)",
    height: "100%",
    fontSize: "0.875rem",
    lineHeight: "1.75rem",
  },
  ".cm-content": {
    padding: "1rem",
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
    caretColor: "var(--color-primary-1)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-background-2)",
    color: "var(--color-text-4)",
    borderRight: "1px solid var(--color-border-3)",
  },
  ".cm-gutterElement": {
    paddingLeft: "0.75rem",
    paddingRight: "0.5rem",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--color-background-3)",
    color: "var(--color-text-2)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--color-background-3)",
  },
  ".cm-selectionBackground": {
    backgroundColor:
      "color-mix(in srgb, var(--color-primary-1) 25%, transparent)",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor:
      "color-mix(in srgb, var(--color-primary-1) 30%, transparent)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--color-primary-1)",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "inherit",
  },
  ".cm-placeholder": {
    color: "var(--color-text-4)",
    fontStyle: "normal",
  },
  ".cm-line": {
    padding: "0 0.25rem",
  },
});

const externalSyncAnnotation = Annotation.define<boolean>();

function getContentAttributes(
  id: string,
  labelId?: string,
): Record<string, string> {
  const attrs: Record<string, string> = {
    id,
    role: "textbox",
    "aria-multiline": "true",
    spellcheck: "false",
  };

  if (labelId) {
    attrs["aria-labelledby"] = labelId;
  } else {
    attrs["aria-label"] = "마크다운 편집기";
  }

  return attrs;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  onEditorReady?: (view: EditorView | null) => void;
  onImageButtonClick?: () => void;
  onImageFiles?: (files: File[]) => void;
  pendingImageCount?: number;
  /**
   * Sets the `id` attribute on the CM6 content element. Read once at mount;
   * changes after initial render are ignored.
   */
  id?: string;
  name?: string;
  labelId?: string;
  /**
   * Placeholder text shown when the editor is empty. Read once at mount;
   * changes after initial render are ignored.
   */
  placeholder?: string;
  placeholderText?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  onEditorReady,
  onImageButtonClick,
  onImageFiles,
  pendingImageCount = 0,
  id = "contentMd",
  name = "contentMd",
  labelId,
  placeholder: legacyPlaceholder,
  placeholderText,
  className,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const placeholderCompartmentRef = useRef(new Compartment());
  const contentAttributesCompartmentRef = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const onEditorReadyRef = useRef(onEditorReady);
  const onImageFilesRef = useRef(onImageFiles);
  onChangeRef.current = onChange;
  onBlurRef.current = onBlur;
  onEditorReadyRef.current = onEditorReady;
  onImageFilesRef.current = onImageFiles;
  const initialValueRef = useRef(value);
  const effectivePlaceholder =
    placeholderText ?? legacyPlaceholder ?? "# 글 내용을 작성하세요";

  const [editorView, setEditorView] = useState<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      bracketMatching(),
      closeBrackets(),
      history(),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle),
      markdown({ base: markdownLanguage }),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        ...markdownKeymap,
      ]),
      EditorView.lineWrapping,
      search(),
      editorTheme,
      placeholderCompartmentRef.current.of(
        editorPlaceholder(effectivePlaceholder),
      ),
      EditorView.updateListener.of((update) => {
        if (
          update.docChanged &&
          !update.transactions.some((transaction) =>
            transaction.annotation(externalSyncAnnotation),
          )
        ) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
      EditorView.domEventHandlers({
        blur: (_event, view) => {
          onBlurRef.current?.(view.state.doc.toString());
        },
        drop: (event) => {
          if (!onImageFilesRef.current) {
            return false;
          }

          const files = Array.from(event.dataTransfer?.files ?? []).filter(
            (file) => file.type.startsWith("image/"),
          );

          if (files.length === 0) {
            return false;
          }

          event.preventDefault();
          onImageFilesRef.current?.(files);

          return true;
        },
        paste: (event) => {
          if (!onImageFilesRef.current) {
            return false;
          }

          const files = Array.from(event.clipboardData?.files ?? []).filter(
            (file) => file.type.startsWith("image/"),
          );

          if (files.length === 0) {
            return false;
          }

          event.preventDefault();
          onImageFilesRef.current?.(files);

          return true;
        },
      }),
      contentAttributesCompartmentRef.current.of(
        EditorView.contentAttributes.of(getContentAttributes(id, labelId)),
      ),
    ];

    const state = EditorState.create({
      doc: initialValueRef.current,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    setEditorView(view);
    onEditorReadyRef.current?.(view);

    return () => {
      onEditorReadyRef.current?.(null);
      view.destroy();
      setEditorView(null);
    };
  }, []);

  useEffect(() => {
    if (!editorView) return;

    editorView.dispatch({
      effects: placeholderCompartmentRef.current.reconfigure(
        editorPlaceholder(effectivePlaceholder),
      ),
    });
  }, [editorView, effectivePlaceholder]);

  useEffect(() => {
    if (!editorView) return;

    editorView.dispatch({
      effects: contentAttributesCompartmentRef.current.reconfigure(
        EditorView.contentAttributes.of(getContentAttributes(id, labelId)),
      ),
    });
  }, [editorView, id, labelId]);

  // Sync value when changed externally (e.g. form reset, edit-mode hydration)
  useEffect(() => {
    if (!editorView) return;

    const current = editorView.state.doc.toString();
    if (current === value) return;

    editorView.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      annotations: [
        externalSyncAnnotation.of(true),
        Transaction.addToHistory.of(false),
      ],
    });
  }, [editorView, value]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <textarea
        aria-hidden="true"
        className="sr-only"
        name={name}
        readOnly
        tabIndex={-1}
        value={value}
      />
      <MarkdownToolbar
        editorView={editorView}
        onImageButtonClick={onImageButtonClick}
        pendingImageCount={pendingImageCount}
      />
      <div
        ref={containerRef}
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          "[&_.cm-editor]:h-full",
          "[&_.cm-editor]:min-h-0",
          "[&_.cm-editor]:outline-none",
          "[&_.cm-editor.cm-focused]:ring-1 [&_.cm-editor.cm-focused]:ring-inset [&_.cm-editor.cm-focused]:ring-primary-1",
          "[&_.cm-scroller]:h-full",
          "[&_.cm-scroller]:min-h-0",
        )}
      />
    </div>
  );
}
