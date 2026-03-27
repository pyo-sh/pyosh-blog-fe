const STORAGE_KEY = "pyosh:guest-secret-comments";

type GuestSecretMap = Record<string, string>;

function isBrowser() {
  return typeof window !== "undefined";
}

function readStore(): GuestSecretMap {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

function writeStore(nextStore: GuestSecretMap) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  } catch {
    // Ignore storage failures so comment UX degrades gracefully.
  }
}

export function rememberGuestSecretComment(commentId: number, body: string) {
  if (!body.trim()) {
    return;
  }

  const currentStore = readStore();
  writeStore({
    ...currentStore,
    [String(commentId)]: body,
  });
}

export function readGuestSecretComment(commentId: number) {
  return readStore()[String(commentId)] ?? null;
}
