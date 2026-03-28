const STORAGE_KEY = "guest-secret-comments";
const LEGACY_STORAGE_KEY = "pyosh:guest-secret-comments";
const LEGACY_ACTIVE_IDENTITY_KEY = "pyosh:guest-secret-comments:identity";
const LEGACY_BODY_CACHE_KEY = "guest-secret-comments-legacy-body-cache";
const MAX_ENTRIES = 20;

type GuestSecretTokenMap = Record<string, string>;
interface LegacyBodyCacheEntry {
  body: string;
  authorKey: string;
}

type LegacyBodyCacheMap = Record<string, LegacyBodyCacheEntry>;

interface LegacyGuestSecretEntry {
  body: string;
  guestNameKey: string;
  guestEmailKey: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function isSecretToken(value: unknown): value is string {
  return typeof value === "string";
}

function isLegacyGuestSecretEntry(
  value: unknown,
): value is LegacyGuestSecretEntry {
  return (
    value !== null &&
    typeof value === "object" &&
    "body" in value &&
    "guestNameKey" in value &&
    "guestEmailKey" in value &&
    typeof value.body === "string" &&
    typeof value.guestNameKey === "string" &&
    typeof value.guestEmailKey === "string"
  );
}

function readTokenStore(): GuestSecretTokenMap {
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
        isSecretToken(entry[1]),
      ),
    );
  } catch {
    return {};
  }
}

function writeTokenStore(nextStore: GuestSecretTokenMap) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  } catch {
    // Ignore storage failures so comment UX degrades gracefully.
  }
}

function readLegacyBodyCache(): LegacyBodyCacheMap {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(LEGACY_BODY_CACHE_KEY);

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
          !("body" in entry[1]) ||
          !("authorKey" in entry[1]) ||
          typeof entry[1].body !== "string" ||
          typeof entry[1].authorKey !== "string"
        ) {
          return [];
        }

        return [[entry[0], entry[1]] as const];
      }),
    );
  } catch {
    return {};
  }
}

function writeLegacyBodyCache(nextStore: LegacyBodyCacheMap) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      LEGACY_BODY_CACHE_KEY,
      JSON.stringify(nextStore),
    );
  } catch {
    // Ignore storage failures so comment UX degrades gracefully.
  }
}

function capStoreEntries<T extends Record<string, unknown>>(store: T) {
  const orderedEntries = Object.entries(store);

  while (orderedEntries.length > MAX_ENTRIES) {
    orderedEntries.shift();
  }

  return Object.fromEntries(orderedEntries) as T;
}

function normalizeGuestName(guestName: string) {
  return guestName.trim().toLowerCase();
}

function normalizeGuestEmail(guestEmail: string) {
  return guestEmail.trim().toLowerCase();
}

function readLegacyStore() {
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
        if (!isLegacyGuestSecretEntry(entry[1])) {
          return [];
        }

        return [[entry[0], entry[1]] as const];
      }),
    );
  } catch {
    return {};
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

export function rememberGuestSecretRevealToken(
  commentId: number,
  revealToken: string,
) {
  if (!revealToken.trim()) {
    return;
  }

  const currentStore = readTokenStore();
  const nextStore = { ...currentStore };
  delete nextStore[String(commentId)];
  nextStore[String(commentId)] = revealToken;

  writeTokenStore(capStoreEntries(nextStore));
}

export function readGuestSecretRevealToken(commentId: number) {
  return readTokenStore()[String(commentId)] ?? null;
}

export function removeGuestSecretRevealToken(commentId: number) {
  const currentStore = readTokenStore();

  if (!(String(commentId) in currentStore)) {
    return;
  }

  const nextStore = { ...currentStore };
  delete nextStore[String(commentId)];
  writeTokenStore(nextStore);
}

export function readLegacyGuestSecretComment(commentId: number) {
  const activeIdentity = readLegacyActiveAuthor();
  const cachedEntry = readLegacyBodyCache()[String(commentId)];

  if (cachedEntry && activeIdentity === cachedEntry.authorKey) {
    return cachedEntry.body;
  }

  const legacyEntry = readLegacyStore()[String(commentId)];

  if (!activeIdentity || !legacyEntry) {
    return null;
  }

  const legacyAuthorKey = `${legacyEntry.guestNameKey}:${legacyEntry.guestEmailKey}`;

  if (legacyAuthorKey !== activeIdentity) {
    return null;
  }

  const nextCache = {
    ...readLegacyBodyCache(),
    [String(commentId)]: {
      body: legacyEntry.body,
      authorKey: legacyAuthorKey,
    },
  };
  writeLegacyBodyCache(capStoreEntries(nextCache));

  return legacyEntry.body;
}
