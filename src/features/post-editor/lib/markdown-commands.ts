import {
  ChangeSpec,
  EditorSelection,
  type EditorState,
} from "@codemirror/state";
import { type EditorView } from "@codemirror/view";
import { type KeyBinding } from "@codemirror/view";

// Shared toggle-wrap helper used by both toolbar and keyboard handlers.
// Operates on selection.main only; multi-cursor support is deferred.
function applyToggleWrap(
  state: EditorState,
  dispatch: EditorView["dispatch"],
  before: string,
  after: string,
): void {
  const { from, to } = state.selection.main;
  const outerFrom = from - before.length;
  const outerTo = to + after.length;
  const beforeRunContinues =
    outerFrom > 0 && state.sliceDoc(outerFrom - 1, outerFrom) === before;
  const afterRunContinues =
    outerTo < state.doc.length &&
    state.sliceDoc(outerTo, outerTo + 1) === after;
  const canUnwrapDelimitedRun =
    beforeRunContinues === afterRunContinues &&
    (before === after ? before.length === 1 || !beforeRunContinues : true);

  const alreadyWrapped =
    outerFrom >= 0 &&
    outerTo <= state.doc.length &&
    state.sliceDoc(outerFrom, from) === before &&
    state.sliceDoc(to, outerTo) === after &&
    canUnwrapDelimitedRun;

  if (alreadyWrapped) {
    dispatch(
      state.update({
        changes: [
          { from: outerFrom, to: from, insert: "" },
          { from: to, to: outerTo, insert: "" },
        ],
        selection: EditorSelection.range(outerFrom, outerFrom + (to - from)),
      }),
    );

    return;
  }

  if (from !== to) {
    dispatch(
      state.update({
        changes: {
          from,
          to,
          insert: `${before}${state.sliceDoc(from, to)}${after}`,
        },
        selection: EditorSelection.range(
          from + before.length,
          to + before.length,
        ),
      }),
    );
  } else {
    dispatch(
      state.update({
        changes: { from, insert: `${before}${after}` },
        selection: EditorSelection.cursor(from + before.length),
      }),
    );
  }
}

export function wrapSelection(
  view: EditorView,
  before: string,
  after: string,
): void {
  applyToggleWrap(view.state, view.dispatch.bind(view), before, after);
  view.focus();
}

function getSelectedLines(state: EditorState) {
  const { from, to } = state.selection.main;
  const rangeEnd =
    to > from && state.sliceDoc(Math.max(from, to - 1), to) === "\n"
      ? to - 1
      : to;
  const lines = [];
  let line = state.doc.lineAt(from);
  const endLine = state.doc.lineAt(rangeEnd);

  while (true) {
    lines.push(line);
    if (line.number >= endLine.number) break;
    line = state.doc.line(line.number + 1);
  }

  return lines;
}

export function toggleLinePrefix(view: EditorView, prefix: string): void {
  const lines = getSelectedLines(view.state);
  const isOrderedList = prefix === "1. ";
  const everyLineHasPrefix = lines.every((line) =>
    isOrderedList ? /^\d+\.\s/.test(line.text) : line.text.startsWith(prefix),
  );
  const changes: ChangeSpec[] = lines.map((line, index) => {
    if (everyLineHasPrefix) {
      const removeLen = isOrderedList
        ? (line.text.match(/^\d+\.\s/)?.[0].length ?? prefix.length)
        : prefix.length;

      return { from: line.from, to: line.from + removeLen, insert: "" };
    }

    const cleaned = line.text
      .replace(/^#{1,6}\s/, "")
      .replace(/^(>\s+|\d+\.\s|-\s)/, "");
    const nextPrefix = isOrderedList ? `${index + 1}. ` : prefix;

    return { from: line.from, to: line.to, insert: `${nextPrefix}${cleaned}` };
  });

  view.dispatch({ changes });

  view.focus();
}

export function insertHorizontalRule(view: EditorView): void {
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const prefix = line.length > 0 ? "\n" : "";
  const insert = `${prefix}---\n`;

  view.dispatch({
    changes: { from: line.to, insert },
    selection: EditorSelection.cursor(line.to + insert.length),
  });

  view.focus();
}

function getFenceInsertion(state: EditorState): {
  from: number;
  to: number;
  insert: string;
  selectionFrom: number;
  selectionTo: number;
} {
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);
  const before = state.sliceDoc(Math.max(0, from - 1), from);
  const after = state.sliceDoc(to, Math.min(state.doc.length, to + 1));
  const needsLeadingBreak = from > 0 && before !== "\n";
  const needsTrailingBreak = to < state.doc.length && after !== "\n";
  const prefix = needsLeadingBreak ? "\n" : "";
  const suffix = needsTrailingBreak ? "\n" : "";

  if (selected) {
    const insert = `${prefix}\`\`\`\n${selected}\n\`\`\`${suffix}`;
    const selectionFrom = from + prefix.length + 4;

    return {
      from,
      to,
      insert,
      selectionFrom,
      selectionTo: selectionFrom + selected.length,
    };
  }

  const insert = `${prefix}\`\`\`\n\n\`\`\`${suffix}`;
  const selectionFrom = from + prefix.length + 4;

  return {
    from,
    to,
    insert,
    selectionFrom,
    selectionTo: selectionFrom,
  };
}

export function insertCodeBlock(view: EditorView): void {
  const { from, to, insert, selectionFrom, selectionTo } = getFenceInsertion(
    view.state,
  );

  view.dispatch({
    changes: { from, to, insert },
    selection: EditorSelection.range(selectionFrom, selectionTo),
  });

  view.focus();
}

export function insertTable(view: EditorView): void {
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const prefix = line.length > 0 ? "\n" : "";
  const template = `${prefix}| 제목 | 제목 |\n|---|---|\n| 내용 | 내용 |\n`;

  view.dispatch({
    changes: { from: line.to, insert: template },
    selection: EditorSelection.cursor(line.to + prefix.length + 2),
  });

  view.focus();
}

function applyLinkTemplate(
  state: EditorState,
  dispatch: EditorView["dispatch"],
): void {
  const { from, to } = state.selection.main;
  const selected = state.sliceDoc(from, to);
  const text = selected || "링크 텍스트";
  const insert = `[${text}](url)`;

  dispatch(
    state.update({
      changes: { from, to, insert },
      selection: EditorSelection.range(
        from + text.length + 3,
        from + text.length + 6,
      ),
    }),
  );
}

export function insertLink(view: EditorView): void {
  applyLinkTemplate(view.state, view.dispatch.bind(view));
  view.focus();
}

export function insertImageTemplate(view: EditorView): void {
  insertMarkdownImage(view, "이미지 설명", "url");
}

export function insertMarkdownImage(
  view: EditorView,
  alt: string,
  src: string,
): void {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const nextAlt = selected || alt;

  view.dispatch({
    changes: { from, to, insert: `![${nextAlt}](${src})` },
    selection: EditorSelection.range(
      from + nextAlt.length + 4,
      from + nextAlt.length + 4 + src.length,
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
  applyToggleWrap(state, dispatch, "**", "**");

  return true;
}

function wrapItalic({
  state,
  dispatch,
}: {
  state: EditorState;
  dispatch: EditorView["dispatch"];
}): boolean {
  applyToggleWrap(state, dispatch, "*", "*");

  return true;
}

function wrapLink({
  state,
  dispatch,
}: {
  state: EditorState;
  dispatch: EditorView["dispatch"];
}): boolean {
  applyLinkTemplate(state, dispatch);

  return true;
}

export const markdownKeymap: KeyBinding[] = [
  { key: "Ctrl-b", mac: "Cmd-b", run: wrapBold },
  { key: "Ctrl-i", mac: "Cmd-i", run: wrapItalic },
  { key: "Ctrl-k", mac: "Cmd-k", run: wrapLink },
];
