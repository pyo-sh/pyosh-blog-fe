"use client";

import { useEffect } from "react";
import { clientMutate } from "@shared/api";

const VIEWED_POSTS_KEY = "viewed_posts";
const inFlightPostIds = new Set<number>();

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

    if (viewedPosts.includes(postId) || inFlightPostIds.has(postId)) {
      return;
    }

    inFlightPostIds.add(postId);
    writeViewedPosts([...viewedPosts, postId]);

    void clientMutate("/api/stats/view", {
      body: JSON.stringify({ postId }),
    })
      .then(() => {
        inFlightPostIds.delete(postId);
      })
      .catch((error: unknown) => {
        inFlightPostIds.delete(postId);
        writeViewedPosts(
          readViewedPosts().filter((viewedPostId) => viewedPostId !== postId),
        );
        console.error(error);
      });
  }, [postId]);
}
