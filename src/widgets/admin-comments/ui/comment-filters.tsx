"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import closeCircleLinear from "@iconify-icons/solar/close-circle-linear";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
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

  useEffect(() => {
    if (postId === undefined) {
      setSelectedPostTitle(undefined);
      setPostSearch("");
    }
  }, [postId]);

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
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative" ref={postDropdownRef}>
          <button
            type="button"
            onClick={handlePostInputFocus}
            className={cn(
              "inline-flex min-w-[12rem] items-center gap-2 rounded-[0.8rem] border px-3 py-2.5 text-sm text-text-2 transition-colors",
              selectedPostTitle
                ? "border-primary-1/30 bg-primary-1/8 text-text-1"
                : "border-border-3 bg-background-1 hover:border-border-2",
            )}
          >
            <span className="max-w-[15rem] truncate">
              {selectedPostTitle ?? "전체 게시글"}
            </span>
          </button>

          {postDropdownOpen ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-[20rem] overflow-hidden rounded-[1rem] border border-border-3 bg-background-1 shadow-[0px_16px_40px_0px_rgba(0,0,0,0.12)]">
              <div className="border-b border-border-3 p-3">
                <div className="relative">
                  <Icon
                    icon={magniferLinear}
                    width="16"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4"
                  />
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
                    placeholder="게시글 제목 검색"
                    className="w-full rounded-[0.8rem] border border-border-3 bg-background-2 py-2.5 pl-9 pr-10 text-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
                  />
                  {postSearch ? (
                    <button
                      type="button"
                      onClick={handleClearPost}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 transition-colors hover:text-text-2"
                      aria-label="글 필터 초기화"
                    >
                      <Icon icon={closeCircleLinear} width="16" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                <button
                  type="button"
                  onClick={handleClearPost}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-background-2",
                    postId === undefined ? "text-primary-1" : "text-text-1",
                  )}
                >
                  전체 게시글
                </button>

                {postLoading ? (
                  <div className="px-4 py-3 text-sm text-text-4">
                    검색 중...
                  </div>
                ) : postOptions.length > 0 ? (
                  <ul>
                    {postOptions.map((post) => (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectPost(post)}
                          className="w-full px-4 py-3 text-left text-sm text-text-1 transition-colors hover:bg-background-2"
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
            </div>
          ) : null}
        </div>

        <label>
          <span className="sr-only">상태</span>
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as CommentStatusFilter)
            }
            className="min-w-[8.5rem] rounded-[0.8rem] border border-border-3 bg-background-1 px-3 py-2.5 text-sm text-text-2 outline-none transition-colors hover:border-border-2 focus:border-primary-1"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value === "all" ? "상태: 전체" : `상태: ${opt.label}`}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">작성자</span>
          <select
            value={authorType}
            onChange={(e) =>
              onAuthorTypeChange(e.target.value as CommentAuthorTypeFilter)
            }
            className="min-w-[9rem] rounded-[0.8rem] border border-border-3 bg-background-1 px-3 py-2.5 text-sm text-text-2 outline-none transition-colors hover:border-border-2 focus:border-primary-1"
          >
            {AUTHOR_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value === "all" ? "작성자: 전체" : `작성자: ${opt.label}`}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-2 rounded-[0.8rem] border border-border-3 bg-background-1 px-3 py-2">
          <span className="text-sm text-text-3">기간</span>
          <input
            type="date"
            value={startDate ?? ""}
            onChange={(e) => onDateChange(e.target.value || undefined, endDate)}
            className="min-w-[8.75rem] bg-transparent text-sm text-text-2 outline-none"
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
            className="min-w-[8.75rem] bg-transparent text-sm text-text-2 outline-none"
            aria-label="종료일"
          />
        </div>
      </div>

      {dateError ? (
        <p className="text-xs text-negative-1">{dateError}</p>
      ) : null}
    </div>
  );
}
