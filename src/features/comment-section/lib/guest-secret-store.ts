const STORAGE_KEY = "guest-secret-comments";
const AUTHOR_KEY = "guest-secret-comment-authors";
const ACTIVE_AUTHOR_KEY = "guest-secret-comment-active-author";
const LEGACY_STORAGE_KEY = "pyosh:guest-secret-comments";
const LEGACY_ACTIVE_IDENTITY_KEY = "pyosh:guest-secret-comments:identity";

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
    const raw =
      window.sessionStorage.getItem(STORAGE_KEY) ??
      window.sessionStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const nextStore = Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] =>
        isGuestSecretEntry(entry[1]),
      ),
    );

    if (!window.sessionStorage.getItem(STORAGE_KEY)) {
      writeStore(nextStore);
    }

    return nextStore;
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

function normalizeGuestEmail(guestEmail: string) {
  return guestEmail.trim().toLowerCase();
}

function createGuestAuthorKey(guestName: string, guestPassword: string) {
  const source = `${normalizeGuestName(guestName)}:${guestPassword.trim()}`;
  let hash = 5381;

  for (const character of source) {
    hash = (hash * 33) ^ character.charCodeAt(0);
  }

  return String(hash >>> 0);
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

function readLegacyAuthorStore() {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap((entry) => {
        if (
          !entry[1] ||
          typeof entry[1] !== "object" ||
          !("guestNameKey" in entry[1]) ||
          !("guestEmailKey" in entry[1]) ||
          typeof entry[1].guestNameKey !== "string" ||
          typeof entry[1].guestEmailKey !== "string"
        ) {
          return [];
        }

        return [
          [
            entry[0],
            `${entry[1].guestNameKey}:${entry[1].guestEmailKey}`,
          ] as const,
        ];
      }),
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

function readLegacyActiveAuthor() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(LEGACY_ACTIVE_IDENTITY_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("guestName" in parsed) ||
      !("guestEmail" in parsed) ||
      typeof parsed.guestName !== "string" ||
      typeof parsed.guestEmail !== "string"
    ) {
      return null;
    }

    return `${normalizeGuestName(parsed.guestName)}:${normalizeGuestEmail(parsed.guestEmail)}`;
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

  writeStore(nextStore);
  writeAuthorStore(nextAuthorStore);
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
  const activeAuthor = readActiveAuthor() ?? readLegacyActiveAuthor();
  const authorKey =
    readAuthorStore()[String(commentId)] ??
    readLegacyAuthorStore()[String(commentId)];

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
