"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTagsClient } from "@entities/tag/api";
import { getErrorMessage } from "@shared/lib/get-error-message";

interface TagChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const MAX_TAG_LENGTH = 30;

function normalizeTag(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function TagChipInput({ value, onChange }: TagChipInputProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTagsClient,
  });

  const existingNames = useMemo(
    () => new Set((tagsQuery.data ?? []).map((tag) => tag.name.toLowerCase())),
    [tagsQuery.data],
  );
  const selectedNames = useMemo(
    () => new Set(value.map((tag) => tag.toLowerCase())),
    [value],
  );
  const suggestions = useMemo(() => {
    const keyword = inputValue.trim().toLowerCase();

    if (!isFocused || keyword.length === 0) {
      return [];
    }

    const matches = (tagsQuery.data ?? [])
      .filter((tag) => !selectedNames.has(tag.name.toLowerCase()))
      .filter((tag) => tag.name.toLowerCase().includes(keyword))
      .slice(0, 6)
      .map((tag) => ({ label: tag.name, isNew: false }));

    const normalizedInput = normalizeTag(inputValue);
    if (
      normalizedInput &&
      !selectedNames.has(normalizedInput.toLowerCase()) &&
      !existingNames.has(normalizedInput.toLowerCase())
    ) {
      matches.unshift({ label: normalizedInput, isNew: true });
    }

    return matches;
  }, [existingNames, inputValue, isFocused, selectedNames, tagsQuery.data]);

  useEffect(() => {
    setActiveIndex(0);
  }, [inputValue]);

  function commitTag(rawValue: string) {
    const nextTag = normalizeTag(rawValue);

    if (!nextTag) {
      return;
    }

    if (nextTag.length > MAX_TAG_LENGTH) {
      return;
    }

    if (selectedNames.has(nextTag.toLowerCase())) {
      setInputValue("");

      return;
    }

    onChange([...value, nextTag]);
    setInputValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0 ? 0 : (current + 1) % suggestions.length,
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0
          ? 0
          : (current - 1 + suggestions.length) % suggestions.length,
      );

      return;
    }

    if (event.key === "Enter") {
      if (isComposing) {
        return;
      }

      event.preventDefault();
      const nextValue =
        suggestions.length > 0 ? suggestions[activeIndex]?.label : inputValue;

      commitTag(nextValue ?? inputValue);

      return;
    }

    if (event.key === "Backspace" && !inputValue && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div
        className="relative rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2.5 transition-colors focus-within:border-primary-1"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap items-center gap-2">
          {value.map((tag) => {
            const isExisting = existingNames.has(tag.toLowerCase());

            return (
              <span
                key={tag}
                className={
                  isExisting
                    ? "inline-flex items-center gap-2 rounded-full bg-background-3 px-2.5 py-1 text-[11px] text-text-2"
                    : "inline-flex items-center gap-2 rounded-full bg-primary-1/10 px-2.5 py-1 text-[11px] text-primary-1"
                }
              >
                {tag}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(value.filter((item) => item !== tag));
                  }}
                  className="text-current/70 transition-opacity hover:opacity-100"
                  aria-label={`${tag} 태그 삭제`}
                >
                  ×
                </button>
              </span>
            );
          })}
          <input
            ref={inputRef}
            id="tags"
            name="tags"
            type="text"
            value={inputValue}
            onChange={(event) =>
              setInputValue(event.target.value.slice(0, MAX_TAG_LENGTH))
            }
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(event) => {
              setIsComposing(false);
              setInputValue(event.currentTarget.value.slice(0, MAX_TAG_LENGTH));
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (!isComposing) {
                commitTag(inputValue);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              value.length === 0 ? "태그 입력 후 Enter" : "태그 추가"
            }
            aria-label="태그"
            aria-expanded={suggestions.length > 0}
            aria-controls={suggestions.length > 0 ? listboxId : undefined}
            className="min-w-[9rem] flex-1 bg-transparent px-1 py-0.5 text-[13px] text-text-2 outline-none placeholder:text-text-4"
          />
        </div>

        {suggestions.length > 0 ? (
          <div
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[0.85rem] border border-border-3 bg-background-2 shadow-[0px_18px_40px_0px_rgba(0,0,0,0.08)]"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.label}-${suggestion.isNew ? "new" : "known"}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => {
                  event.preventDefault();
                  commitTag(suggestion.label);
                }}
                className={
                  index === activeIndex
                    ? "flex w-full items-center justify-between bg-background-3 px-3 py-2.5 text-left text-[13px] text-text-1"
                    : "flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-text-2 transition-colors hover:bg-background-3"
                }
              >
                <span>{suggestion.label}</span>
                <span
                  className={
                    suggestion.isNew
                      ? "text-[11px] font-medium text-primary-1"
                      : "text-[11px] text-text-4"
                  }
                >
                  {suggestion.isNew ? "새 태그" : "기존 태그"}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {tagsQuery.isError ? (
        <p className="text-[11px] text-negative-1">
          {getErrorMessage(tagsQuery.error, "태그 목록을 불러오지 못했습니다.")}
        </p>
      ) : (
        <p className="text-[11px] text-text-4">
          기존 태그는 중성색, 새 태그는 강조색으로 표시됩니다.
        </p>
      )}
    </div>
  );
}
