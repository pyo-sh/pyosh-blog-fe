"use client";

const DEFAULT_LIMIT = 200;

export function extractPlainText(
  markdown: string,
  limit = DEFAULT_LIMIT,
): string {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[>*_~]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= limit) {
    return plainText;
  }

  const ellipsis = "...";
  const safeLimit = Math.max(limit - ellipsis.length, 0);

  if (safeLimit === 0) {
    return ellipsis.slice(0, limit);
  }

  return `${plainText.slice(0, safeLimit).trimEnd()}${ellipsis}`;
}
