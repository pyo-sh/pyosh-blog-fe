import type { EditorView } from "@codemirror/view";

export function attachScrollSync(
  editorView: EditorView,
  previewEl: HTMLElement,
): () => void {
  let frame = 0;

  const sync = () => {
    frame = 0;
    const editorScroll = editorView.scrollDOM;
    const editorScrollable =
      editorScroll.scrollHeight - editorScroll.clientHeight;
    const previewScrollable = previewEl.scrollHeight - previewEl.clientHeight;

    if (editorScrollable <= 0 || previewScrollable <= 0) {
      previewEl.scrollTop = 0;

      return;
    }

    const ratio = editorScroll.scrollTop / editorScrollable;
    previewEl.scrollTop = ratio * previewScrollable;
  };

  const onScroll = () => {
    if (frame !== 0) {
      return;
    }

    frame = window.requestAnimationFrame(sync);
  };

  editorView.scrollDOM.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return () => {
    editorView.scrollDOM.removeEventListener("scroll", onScroll);

    if (frame !== 0) {
      window.cancelAnimationFrame(frame);
    }
  };
}
