"use client";

import { useEffect } from "react";
import { clientMutate } from "@shared/api";

const PENDING_SITE_VIEW_TTL_MS = 5 * 60 * 1000;
const PENDING_SITE_VIEW_KEY = "pending_site_view";
const SITE_VIEWED_KEY = "site_viewed";

let siteViewRequestInFlight = false;

function readPendingTimestamp(): number | null {
  const storedValue = window.sessionStorage.getItem(PENDING_SITE_VIEW_KEY);

  if (!storedValue) {
    return null;
  }

  const timestamp = Number(storedValue);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  if (Date.now() - timestamp >= PENDING_SITE_VIEW_TTL_MS) {
    window.sessionStorage.removeItem(PENDING_SITE_VIEW_KEY);

    return null;
  }

  return timestamp;
}

export function useSiteViewCount(enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (
      window.sessionStorage.getItem(SITE_VIEWED_KEY) ||
      readPendingTimestamp() ||
      siteViewRequestInFlight
    ) {
      return;
    }

    siteViewRequestInFlight = true;
    window.sessionStorage.setItem(PENDING_SITE_VIEW_KEY, String(Date.now()));

    // The empty payload tells the backend to record a site-wide visit (postId: null).
    void clientMutate("/api/stats/view", {
      body: JSON.stringify({}),
      keepalive: true,
    })
      .then(() => {
        siteViewRequestInFlight = false;
        window.sessionStorage.removeItem(PENDING_SITE_VIEW_KEY);
        window.sessionStorage.setItem(SITE_VIEWED_KEY, "true");
      })
      .catch((error: unknown) => {
        siteViewRequestInFlight = false;
        window.sessionStorage.removeItem(PENDING_SITE_VIEW_KEY);
        console.error(error);
      });
  }, [enabled]);
}
