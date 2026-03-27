import { EditorSelection, type EditorState } from "@codemirror/state";
import { type EditorView } from "@codemirror/view";
import { type KeyBinding } from "@codemirror/view";

export function wrapSelection(
  view: EditorView,
  before: string,
  after: string,
): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);

  if (selected) {
    view.dispatch({
      changes: { from, to, insert: `${before}${selected}${after}` },
      selection: EditorSelection.range(
        from + before.length,
        to + before.length,
      ),
    });
  } else {
    view.dispatch({
      changes: { from, insert: `${before}${after}` },
      selection: EditorSelection.cursor(from + before.length),
    });
  }

  view.focus();
}

export function toggleLinePrefix(view: EditorView, prefix: string): void {
  const line = view.state.doc.lineAt(view.state.selection.main.from);
  const hasPrefix = line.text.startsWith(prefix);

  if (hasPrefix) {
    view.dispatch({
      changes: { from: line.from, to: line.from + prefix.length, insert: "" },
    });
  } else {
    const cleaned = line.text.replace(/^#{1,6}\s/, "");
    view.dispatch({
      changes: { from: line.from, to: line.to, insert: `${prefix}${cleaned}` },
    });
  }

  view.focus();
}

export function insertAtCursor(view: EditorView, text: string): void {
  const { from } = view.state.selection.main;

  view.dispatch({
    changes: { from, insert: text },
    selection: EditorSelection.cursor(from + text.length),
  });

  view.focus();
}

export function insertHorizontalRule(view: EditorView): void {
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const prefix = line.length > 0 ? "\n" : "";

  view.dispatch({
    changes: { from: line.to, insert: `${prefix}\n---\n` },
    selection: EditorSelection.cursor(line.to + prefix.length + 5),
  });

  view.focus();
}

export function insertCodeBlock(view: EditorView): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);

  if (selected) {
    view.dispatch({
      changes: { from, to, insert: `\`\`\`\n${selected}\n\`\`\`` },
      selection: EditorSelection.range(from + 4, from + 4 + selected.length),
    });
  } else {
    const template = "```\n\n```";
    view.dispatch({
      changes: { from, insert: template },
      selection: EditorSelection.cursor(from + 4),
    });
  }

  view.focus();
}

export function insertTable(view: EditorView): void {
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const prefix = line.length > 0 ? "\n" : "";
  const template = `${prefix}\n| 제목 | 제목 |\n|---|---|\n| 내용 | 내용 |\n`;

  view.dispatch({
    changes: { from: line.to, insert: template },
    selection: EditorSelection.cursor(line.to + prefix.length + 2),
  });

  view.focus();
}

export function insertLink(view: EditorView): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const text = selected || "링크 텍스트";
  const insert = `[${text}](url)`;

  view.dispatch({
    changes: { from, to, insert },
    selection: EditorSelection.range(
      from + text.length + 3,
      from + text.length + 6,
    ),
  });

  view.focus();
}

export function insertImageTemplate(view: EditorView): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const alt = selected || "이미지 설명";

  view.dispatch({
    changes: { from, to, insert: `![${alt}](url)` },
    selection: EditorSelection.range(
      from + alt.length + 4,
      from + alt.length + 4 + 3,
    ),
  });

  view.focus();
}

function wrapBold({
  state,
  dispatch,
}: {
  state: EditorState;
  dispatch: EditorView["dispatch"];
}): boolean {
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);
  dispatch(
    state.update({
      changes: selected
        ? { from, to, insert: `**${selected}**` }
        : { from, insert: "****" },
      selection: selected
        ? EditorSelection.range(from + 2, to + 2)
        : EditorSelection.cursor(from + 2),
    }),
  );

  return true;
}

function wrapItalic({
  state,
  dispatch,
}: {
  state: EditorState;
  dispatch: EditorView["dispatch"];
}): boolean {
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);
  dispatch(
    state.update({
      changes: selected
        ? { from, to, insert: `*${selected}*` }
        : { from, insert: "**" },
      selection: selected
        ? EditorSelection.range(from + 1, to + 1)
        : EditorSelection.cursor(from + 1),
    }),
  );

  return true;
}

function wrapLink({
  state,
  dispatch,
}: {
  state: EditorState;
  dispatch: EditorView["dispatch"];
}): boolean {
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);
  const text = selected || "링크 텍스트";
  const insert = `[${text}](url)`;
  dispatch(
    state.update({
      changes: { from, to, insert },
      selection: EditorSelection.range(
        from + text.length + 3,
        from + text.length + 3 + 3,
      ),
    }),
  );

  return true;
}

export const markdownKeymap: KeyBinding[] = [
  { key: "Ctrl-b", mac: "Cmd-b", run: wrapBold },
  { key: "Ctrl-i", mac: "Cmd-i", run: wrapItalic },
  { key: "Ctrl-k", mac: "Cmd-k", run: wrapLink },
];
