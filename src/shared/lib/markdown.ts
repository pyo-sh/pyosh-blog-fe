import rehypeShiki from "@shikijs/rehype";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

export interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

const HEADING_ID_PREFIX = "user-content-";

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
    h1: [...(defaultSchema.attributes?.h1 ?? []), "id"],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
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
  .use(rehypeSlug, { prefix: HEADING_ID_PREFIX })
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify)
  .freeze();

export async function renderMarkdown(md: string): Promise<string> {
  return String(await processor.process(md));
}

export function extractHeadings(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: TocItem[] = [];

  visit(tree, "heading", (node) => {
    const heading = node as { depth: number };

    if (heading.depth < 1 || heading.depth > 3) {
      return;
    }

    const text = toString(heading).trim();

    if (!text) {
      return;
    }

    headings.push({
      id: `${HEADING_ID_PREFIX}${slugger.slug(text)}`,
      text,
      level: heading.depth as TocItem["level"],
    });
  });

  return headings;
}
