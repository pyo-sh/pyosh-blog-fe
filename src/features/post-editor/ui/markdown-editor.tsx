"use client";

import type { ChangeEventHandler } from "react";
import { cn } from "@shared/lib/style-utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  id = "contentMd",
  name = "contentMd",
  placeholder = "# 글 내용을 작성하세요",
  className,
}: MarkdownEditorProps) {
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      spellCheck={false}
      className={cn(
        "h-full min-h-[60vh] w-full resize-none rounded-[1.25rem] border border-border-3 bg-background-1 px-4 py-4 font-mono text-sm leading-7 text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1",
        className,
      )}
    />
  );
}
