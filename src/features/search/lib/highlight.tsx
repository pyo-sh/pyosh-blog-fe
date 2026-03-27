import React from "react";

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    i % 2 !== 0 ? (
      <mark key={i} className="rounded-sm bg-primary-1/20 text-text-1">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
