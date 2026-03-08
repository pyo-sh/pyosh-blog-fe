import rehypeShiki from "@shikijs/rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), "style", "className"],
    pre: [...(defaultSchema.attributes?.pre ?? []), "style", "className"],
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
  },
};

export async function renderMarkdown(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeShiki, { theme: "github-dark" })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(md);

  return String(result);
}
