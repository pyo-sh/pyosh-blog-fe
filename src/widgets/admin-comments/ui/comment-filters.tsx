"use client";

import { useEffect, useRef, useState } from "react";
import type { Post } from "@entities/post";
import { fetchAdminPosts } from "@entities/post";
import { cn } from "@shared/lib/style-utils";

export type CommentStatusFilter = "all" | "active" | "deleted" | "hidden";
export type CommentAuthorTypeFilter = "all" | "oauth" | "guest";

interface CommentFiltersProps {
  status: CommentStatusFilter;
  authorType: CommentAuthorTypeFilter;
  postId: number | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
  dateError: string | undefined;
  onStatusChange: (v: CommentStatusFilter) => void;
  onAuthorTypeChange: (v: CommentAuthorTypeFilter) => void;
  onPostChange: (id: number | undefined, title: string | undefined) => void;
  onDateChange: (start: string | undefined, end: string | undefined) => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: CommentStatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "정상", value: "active" },
  { label: "삭제됨", value: "deleted" },
  { label: "숨김", value: "hidden" },
];

const AUTHOR_TYPE_OPTIONS: Array<{
  label: string;
  value: CommentAuthorTypeFilter;
}> = [
  { label: "전체", value: "all" },
  { label: "OAuth", value: "oauth" },
  { label: "게스트", value: "guest" },
];

export function CommentFilters({
  status,
  authorType,
  postId,
  startDate,
  endDate,
  dateError,
  onStatusChange,
  onAuthorTypeChange,
  onPostChange,
  onDateChange,
}: CommentFiltersProps) {
  const [postSearch, setPostSearch] = useState("");
  const [postOptions, setPostOptions] = useState<Post[]>([]);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);
  const [selectedPostTitle, setSelectedPostTitle] = useState<
    string | undefined
  >(undefined);
  const [postLoading, setPostLoading] = useState(false);
  const postDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        postDropdownRef.current &&
        !postDropdownRef.current.contains(e.target as Node)
      ) {
        setPostDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected post title when postId is cleared externally
  useEffect(() => {
    if (postId === undefined) {
      setSelectedPostTitle(undefined);
      setPostSearch("");
    }
  }, [postId]);

  // Debounced post search
  useEffect(() => {
    if (!postDropdownOpen) return;

    const timer = setTimeout(() => {
      void (async () => {
        setPostLoading(true);
        try {
          const result = await fetchAdminPosts({
            q: postSearch || undefined,
            limit: 20,
          });
          setPostOptions(result.data);
        } catch {
          setPostOptions([]);
        } finally {
          setPostLoading(false);
        }
      })();
    }, 300);

    return () => clearTimeout(timer);
  }, [postSearch, postDropdownOpen]);

  function handlePostInputFocus() {
    setPostDropdownOpen(true);
  }

  function handleSelectPost(post: Post) {
    setSelectedPostTitle(post.title);
    setPostSearch(post.title);
    setPostDropdownOpen(false);
    onPostChange(post.id, post.title);
  }

  function handleClearPost() {
    setSelectedPostTitle(undefined);
    setPostSearch("");
    setPostDropdownOpen(false);
    onPostChange(undefined, undefined);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Status filter */}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-2">상태</span>
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as CommentStatusFilter)
          }
          className="min-w-28 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {/* Author type filter */}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-2">작성자</span>
        <select
          value={authorType}
          onChange={(e) =>
            onAuthorTypeChange(e.target.value as CommentAuthorTypeFilter)
          }
          className="min-w-28 rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
        >
          {AUTHOR_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {/* Post search filter */}
      <div className="flex flex-col gap-1.5" ref={postDropdownRef}>
        <span className="text-xs font-medium text-text-2">글</span>
        <div className="relative">
          <input
            type="text"
            value={postSearch}
            onChange={(e) => {
              setPostSearch(e.target.value);
              if (selectedPostTitle) {
                setSelectedPostTitle(undefined);
                onPostChange(undefined, undefined);
              }
            }}
            onFocus={handlePostInputFocus}
            placeholder="글 제목 검색"
            className={cn(
              "w-52 rounded-[0.75rem] border bg-background-1 px-3 py-2 pr-8 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4",
              selectedPostTitle
                ? "border-primary-1"
                : "border-border-3 focus:border-primary-1",
            )}
          />
          {postSearch ? (
            <button
              type="button"
              onClick={handleClearPost}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-2"
              aria-label="글 필터 초기화"
            >
              ✕
            </button>
          ) : null}

          {postDropdownOpen ? (
            <div className="absolute top-full left-0 z-20 mt-1 w-full min-w-[16rem] overflow-hidden rounded-[0.75rem] border border-border-3 bg-background-2 shadow-lg">
              {postLoading ? (
                <div className="px-4 py-3 text-sm text-text-4">검색 중...</div>
              ) : postOptions.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto py-1">
                  {postOptions.map((post) => (
                    <li key={post.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectPost(post)}
                        className="w-full px-4 py-2.5 text-left text-sm text-text-1 transition-colors hover:bg-background-3"
                      >
                        <span className="line-clamp-1">{post.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-text-4">
                  검색 결과 없음
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-2">기간</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate ?? ""}
            onChange={(e) => onDateChange(e.target.value || undefined, endDate)}
            className="rounded-[0.75rem] border border-border-3 bg-background-1 px-3 py-2 text-sm text-text-1 outline-none transition-colors focus:border-primary-1"
            aria-label="시작일"
          />
          <span className="text-xs text-text-4">~</span>
          <input
            type="date"
            value={endDate ?? ""}
            min={startDate}
            onChange={(e) =>
              onDateChange(startDate, e.target.value || undefined)
            }
            className={cn(
              "rounded-[0.75rem] border bg-background-1 px-3 py-2 text-sm text-text-1 outline-none transition-colors focus:border-primary-1",
              dateError ? "border-negative-1" : "border-border-3",
            )}
            aria-label="종료일"
          />
        </div>
        {dateError ? (
          <p className="text-xs text-negative-1">{dateError}</p>
        ) : null}
      </div>
    </div>
  );
}
