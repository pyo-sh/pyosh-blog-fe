"use client";

import { useEffect } from "react";
import { clientMutate } from "@shared/api";

const PENDING_VIEW_TTL_MS = 5 * 60 * 1000;
const RECORDED_VIEWS_KEY = "recorded_view_posts";
const PENDING_VIEWS_KEY = "pending_viewed_posts";
const inFlightPostIds = new Set<number>();

function readTimestampMap(storageKey: string): Record<string, number> {
  const storedValue = window.sessionStorage.getItem(storageKey);

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

function writeTimestampMap(
  storageKey: string,
  valueMap: Record<string, number>,
): void {
  window.sessionStorage.setItem(storageKey, JSON.stringify(valueMap));
}

function clearTimestampEntry(storageKey: string, postId: number): void {
  const valueMap = readTimestampMap(storageKey);

  delete valueMap[String(postId)];
  writeTimestampMap(storageKey, valueMap);
}

export function useViewCount(postId: number): void {
  useEffect(() => {
    const pendingViews = readTimestampMap(PENDING_VIEWS_KEY);
    const recordedViews = readTimestampMap(RECORDED_VIEWS_KEY);

    if (
      pendingViews[String(postId)] ||
      recordedViews[String(postId)] ||
      inFlightPostIds.has(postId)
    ) {
      return;
    }

    inFlightPostIds.add(postId);
    writeTimestampMap(PENDING_VIEWS_KEY, {
      ...pendingViews,
      [postId]: Date.now(),
    });

    void clientMutate("/api/stats/view", {
      body: JSON.stringify({ postId }),
      keepalive: true,
    })
      .then(() => {
        inFlightPostIds.delete(postId);
        clearTimestampEntry(PENDING_VIEWS_KEY, postId);
        writeTimestampMap(RECORDED_VIEWS_KEY, {
          ...readTimestampMap(RECORDED_VIEWS_KEY),
          [postId]: Date.now(),
        });
      })
      .catch((error: unknown) => {
        inFlightPostIds.delete(postId);
        clearTimestampEntry(PENDING_VIEWS_KEY, postId);
        console.error(error);
      });
  }, [postId]);
}
