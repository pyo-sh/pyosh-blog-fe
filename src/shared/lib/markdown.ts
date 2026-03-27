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

function rehypeHeadingIds() {
  const seen = new Map<string, number>();

  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (!["h1", "h2", "h3"].includes(node.tagName)) {
        return;
      }

      const text = extractElementText(node).trim();

      if (!text) {
        return;
      }

      const baseSlug = slugifyHeading(text);
      const count = seen.get(baseSlug) ?? 0;
      seen.set(baseSlug, count + 1);
      node.properties.id =
        count === 0
          ? `${HEADING_ID_PREFIX}${baseSlug}`
          : `${HEADING_ID_PREFIX}${baseSlug}-${count}`;
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
  .use(rehypeHeadingIds)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify)
  .freeze();

export async function renderMarkdown(md: string): Promise<string> {
  return String(await processor.process(md));
}

export function extractHeadings(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const seen = new Map<string, number>();
  const headings: TocItem[] = [];

  visit(tree, "heading", (node: { depth?: number; children?: unknown[] }) => {
    const depth = node.depth;

    if (depth === undefined || depth < 1 || depth > 3) {
      return;
    }

    const text = extractMdastText(node).trim();

    if (!text) {
      return;
    }

    const baseSlug = slugifyHeading(text);
    const count = seen.get(baseSlug) ?? 0;
    seen.set(baseSlug, count + 1);

    headings.push({
      id:
        count === 0
          ? `${HEADING_ID_PREFIX}${baseSlug}`
          : `${HEADING_ID_PREFIX}${baseSlug}-${count}`,
      text,
      level: depth as TocItem["level"],
    });
  });

  return headings;
}

function slugifyHeading(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "section";
}

function extractElementText(node: Element): string {
  return node.children
    .map((child) => {
      if (child.type === "text") {
        return child.value;
      }

      if (child.type === "element") {
        return extractElementText(child);
      }

      return "";
    })
    .join("");
}

function extractMdastText(node: {
  children?: unknown[];
  value?: string;
}): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }

  return (node.children ?? [])
    .map((child) =>
      extractMdastText(child as { children?: unknown[]; value?: string }),
    )
    .join("");
}
