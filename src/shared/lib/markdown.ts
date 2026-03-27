import rehypeShiki from "@shikijs/rehype";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

// <img> 노드에 loading="lazy" decoding="async" 속성 추가
function rehypeLazyImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
      }
    });
  };
}

// Allow shiki's inline style attributes and GFM elements
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Shiki 코드 하이라이팅
    span: [...(defaultSchema.attributes?.span ?? []), "style", "className"],
    pre: [...(defaultSchema.attributes?.pre ?? []), "style", "className"],
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
    // GFM 체크박스 (type은 checkbox만 허용)
    input: [["type", "checkbox"] as [string, string], "checked", "disabled"],
    // 외부 링크 (target은 _blank만 허용)
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ["target", "_blank"] as [string, string],
      "rel",
    ],
    // 이미지 지연 로딩
    img: [...(defaultSchema.attributes?.img ?? []), "loading", "decoding"],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "input", // GFM 체크박스
    "del", // GFM 취소선
  ],
};

// Create once at module level so rehypeShiki's highlighter is not re-initialized per call
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeShiki, { theme: "github-dark" })
  .use(rehypeExternalLinks, {
    target: "_blank",
    rel: ["noopener", "noreferrer"],
  })
  .use(rehypeLazyImages)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify)
  .freeze();

export async function renderMarkdown(md: string): Promise<string> {
  return String(await processor.process(md));
}
