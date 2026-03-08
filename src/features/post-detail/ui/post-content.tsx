import { renderMarkdown } from "@shared/lib/markdown";

interface PostContentProps {
  contentMd: string;
}

export async function PostContent({ contentMd }: PostContentProps) {
  const html = await renderMarkdown(contentMd);

  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
