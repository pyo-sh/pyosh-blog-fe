import rehypeShiki from "@shikijs/rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

// Allow shiki's inline style attributes for syntax highlighting colors
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), "style", "className"],
    pre: [...(defaultSchema.attributes?.pre ?? []), "style", "className"],
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
  },
};

// Create once at module level so rehypeShiki's highlighter is not re-initialized per call
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeShiki, { theme: "github-dark" })
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify)
  .freeze();

export async function renderMarkdown(md: string): Promise<string> {
  return String(await processor.process(md));
}
