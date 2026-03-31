import { CodeBlockEnhancer } from "./code-block-enhancer";
import { renderMarkdown } from "@shared/lib/markdown";

interface PostContentProps {
  contentMd: string;
}

export async function PostContent({ contentMd }: PostContentProps) {
  const html = await renderMarkdown(contentMd);

  return (
    <CodeBlockEnhancer>
      <div
        className="markdown-content post-markdown prose max-w-none break-keep"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </CodeBlockEnhancer>
  );
}
