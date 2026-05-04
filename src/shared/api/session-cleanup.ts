type ClientSessionCleanupCallback = () => void;

const cleanupCallbacks = new Set<ClientSessionCleanupCallback>();

let isCleanupRunning = false;

export function registerClientSessionCleanup(
  callback: ClientSessionCleanupCallback,
): () => void {
  cleanupCallbacks.add(callback);

  return () => {
    cleanupCallbacks.delete(callback);
  };
}

export function runClientSessionCleanup(): void {
  if (isCleanupRunning) {
    return;
  }

  isCleanupRunning = true;

  try {
    Array.from(cleanupCallbacks).forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.warn("[Session Cleanup] cleanup callback failed", error);
      }
    });
  } finally {
    isCleanupRunning = false;
  }
}

export function handleManageAuthBoundaryFailure(status: number): boolean {
  if (
    typeof window === "undefined" ||
    !window.location.pathname.startsWith("/manage") ||
    (status !== 401 && status !== 403)
  ) {
    return false;
  }

  runClientSessionCleanup();
  window.location.href =
    status === 403 ? "/manage/login?reason=forbidden" : "/manage/login";

  return true;
}
