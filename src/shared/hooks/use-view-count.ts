"use client";

import { useEffect } from "react";
import { clientMutate } from "@shared/api";

const PENDING_VIEW_TTL_MS = 5 * 60 * 1000;
const PENDING_VIEWS_KEY = "pending_viewed_posts";
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
  window.sessionStorage.setItem(
    VIEWED_POSTS_KEY,
    JSON.stringify(Array.from(new Set(postIds))),
  );
}

function readPendingViews(): Record<string, number> {
  const storedValue = window.sessionStorage.getItem(PENDING_VIEWS_KEY);

  if (!storedValue) {
    return {};
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    const now = Date.now();

    return Object.entries(parsedValue).reduce<Record<string, number>>(
      (pendingViews, [key, value]) => {
        if (typeof value === "number" && now - value < PENDING_VIEW_TTL_MS) {
          pendingViews[key] = value;
        }

        return pendingViews;
      },
      {},
    );
  } catch {
    return {};
  }
}

function writePendingViews(pendingViews: Record<string, number>): void {
  window.sessionStorage.setItem(
    PENDING_VIEWS_KEY,
    JSON.stringify(pendingViews),
  );
}

function clearPendingView(postId: number): void {
  const pendingViews = readPendingViews();

  delete pendingViews[String(postId)];
  writePendingViews(pendingViews);
}

export function useViewCount(postId: number): void {
  useEffect(() => {
    const viewedPosts = readViewedPosts();
    const pendingViews = readPendingViews();

    if (
      viewedPosts.includes(postId) ||
      pendingViews[String(postId)] ||
      inFlightPostIds.has(postId)
    ) {
      return;
    }

    inFlightPostIds.add(postId);
    writePendingViews({
      ...pendingViews,
      [postId]: Date.now(),
    });

    void clientMutate("/api/stats/view", {
      body: JSON.stringify({ postId }),
      keepalive: true,
    })
      .then(() => {
        inFlightPostIds.delete(postId);
        clearPendingView(postId);
        writeViewedPosts([...readViewedPosts(), postId]);
      })
      .catch((error: unknown) => {
        inFlightPostIds.delete(postId);
        clearPendingView(postId);
        console.error(error);
      });
  }, [postId]);
}
