const STORAGE_KEY = "guest-secret-comments";
const AUTHOR_KEY = "guest-secret-comment-authors";
const ACTIVE_AUTHOR_KEY = "guest-secret-comment-active-author";
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

function normalizeGuestName(guestName: string) {
  return guestName.trim().toLowerCase();
}

function createGuestAuthorKey(guestName: string, guestPassword: string) {
  const source = `${normalizeGuestName(guestName)}:${guestPassword.trim()}`;
  let hash = 5381;

  for (const character of source) {
    hash = (hash * 33) ^ character.charCodeAt(0);
  }

  return String(hash >>> 0);
}

function trimToMaxEntries(store: GuestSecretMap) {
  const orderedEntries = Object.entries(store);

  while (orderedEntries.length > MAX_ENTRIES) {
    orderedEntries.shift();
  }

  return Object.fromEntries(orderedEntries);
}

function readAuthorStore() {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(AUTHOR_KEY);

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

function writeAuthorStore(nextStore: GuestSecretMap) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(AUTHOR_KEY, JSON.stringify(nextStore));
  } catch {
    // Ignore storage failures so comment UX degrades gracefully.
  }
}

function readActiveAuthor() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(ACTIVE_AUTHOR_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeActiveAuthor(authorKey: string) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(ACTIVE_AUTHOR_KEY, JSON.stringify(authorKey));
  } catch {
    // Ignore storage failures so comment UX degrades gracefully.
  }
}

export function rememberGuestSecretComment(
  commentId: number,
  body: string,
  guestName: string,
  guestPassword: string,
) {
  const authorKey = createGuestAuthorKey(guestName, guestPassword);

  if (!body.trim() || !guestPassword.trim()) {
    return;
  }

  const currentStore = readStore();
  const nextStore = { ...currentStore };
  delete nextStore[String(commentId)];
  nextStore[String(commentId)] = body;

  const currentAuthorStore = readAuthorStore();
  const nextAuthorStore = { ...currentAuthorStore };
  delete nextAuthorStore[String(commentId)];
  nextAuthorStore[String(commentId)] = authorKey;

  writeStore(trimToMaxEntries(nextStore));
  writeAuthorStore(trimToMaxEntries(nextAuthorStore));
  writeActiveAuthor(authorKey);
}

export function readGuestSecretComment(
  commentId: number,
  guestName?: string | null,
  guestPassword?: string | null,
) {
  const currentAuthorKey =
    guestName && guestPassword
      ? createGuestAuthorKey(guestName, guestPassword)
      : null;
  const activeAuthor = readActiveAuthor();
  const authorKey = readAuthorStore()[String(commentId)];

  if (!authorKey) {
    return null;
  }

  if (currentAuthorKey) {
    if (currentAuthorKey !== authorKey) {
      return null;
    }
  } else if (activeAuthor !== authorKey) {
    return null;
  }

  return readStore()[String(commentId)] ?? null;
}
