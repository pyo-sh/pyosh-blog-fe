const STORAGE_KEY = "guest-secret-comments";
const MAX_ENTRIES = 20;

type GuestSecretMap = Record<string, string>;

function isBrowser() {
  return typeof window !== "undefined";
}

function isGuestSecretEntry(value: unknown): value is string {
  return typeof value === "string";
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
      Object.entries(parsed).filter((entry): entry is [string, string] =>
        isGuestSecretEntry(entry[1]),
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
  const nextStore = { ...currentStore };
  delete nextStore[String(commentId)];
  nextStore[String(commentId)] = body;

  const orderedEntries = Object.entries(nextStore);

  while (orderedEntries.length > MAX_ENTRIES) {
    orderedEntries.shift();
  }

  writeStore(Object.fromEntries(orderedEntries));
}

export function readGuestSecretComment(commentId: number) {
  return readStore()[String(commentId)] ?? null;
}
