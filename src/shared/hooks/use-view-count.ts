"use client";

import { useEffect } from "react";
import { clientMutate } from "@shared/api";

const VIEWED_POSTS_KEY = "viewed_posts";

function readViewedPosts(): number[] {
  const storedValue = window.sessionStorage.getItem(VIEWED_POSTS_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (value): value is number => typeof value === "number",
    );
  } catch {
    return [];
  }
}

function writeViewedPosts(postIds: number[]): void {
  window.sessionStorage.setItem(VIEWED_POSTS_KEY, JSON.stringify(postIds));
}

export function useViewCount(postId: number): void {
  useEffect(() => {
    const viewedPosts = readViewedPosts();

    if (viewedPosts.includes(postId)) {
      return;
    }

    let cancelled = false;

    void clientMutate("/api/stats/view", {
      body: JSON.stringify({ postId }),
    })
      .then(() => {
        if (cancelled) {
          return;
        }

        writeViewedPosts([...viewedPosts, postId]);
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);
}
