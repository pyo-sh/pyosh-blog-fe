const STORAGE_KEY = "pyosh:guest-secret-comments";
const ACTIVE_IDENTITY_KEY = "pyosh:guest-secret-comments:identity";

interface GuestSecretEntry {
  body: string;
  guestName: string;
  guestNameKey: string;
  guestEmailKey: string;
}

type GuestSecretMap = Record<string, GuestSecretEntry>;

interface GuestIdentity {
  guestName: string;
  guestEmail: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeIdentity(identity: GuestIdentity) {
  return {
    guestName: identity.guestName.trim().toLowerCase(),
    guestEmail: identity.guestEmail.trim().toLowerCase(),
  };
}

function isGuestSecretEntry(value: unknown): value is GuestSecretEntry {
  return (
    value !== null &&
    typeof value === "object" &&
    "body" in value &&
    "guestName" in value &&
    "guestNameKey" in value &&
    "guestEmailKey" in value &&
    typeof value.body === "string" &&
    typeof value.guestName === "string" &&
    typeof value.guestNameKey === "string" &&
    typeof value.guestEmailKey === "string"
  );
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
        (entry): entry is [string, GuestSecretEntry] =>
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

function readActiveIdentity(): GuestIdentity | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(ACTIVE_IDENTITY_KEY);

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

    return {
      guestName: parsed.guestName,
      guestEmail: parsed.guestEmail,
    };
  } catch {
    return null;
  }
}

function writeActiveIdentity(identity: GuestIdentity) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      ACTIVE_IDENTITY_KEY,
      JSON.stringify({
        guestName: identity.guestName.trim(),
        guestEmail: identity.guestEmail.trim().toLowerCase(),
      }),
    );
  } catch {
    // Ignore storage failures so comment UX degrades gracefully.
  }
}

export function rememberGuestSecretComment(
  commentId: number,
  body: string,
  identity: GuestIdentity,
) {
  const normalizedIdentity = normalizeIdentity(identity);

  if (
    !body.trim() ||
    !normalizedIdentity.guestName ||
    !normalizedIdentity.guestEmail
  ) {
    return;
  }

  const currentStore = readStore();
  writeActiveIdentity(identity);
  writeStore({
    ...currentStore,
    [String(commentId)]: {
      body,
      guestName: identity.guestName.trim(),
      guestNameKey: normalizedIdentity.guestName,
      guestEmailKey: normalizedIdentity.guestEmail,
    },
  });
}

export function readGuestSecretComment(
  commentId: number,
  identity: GuestIdentity | null,
) {
  if (!identity) {
    return null;
  }

  const entry = readStore()[String(commentId)];

  if (!entry) {
    return null;
  }

  const normalizedIdentity = normalizeIdentity(identity);

  if (
    entry.guestNameKey !== normalizedIdentity.guestName ||
    entry.guestEmailKey !== normalizedIdentity.guestEmail
  ) {
    return null;
  }

  return entry.body;
}

export function readGuestSecretIdentity() {
  return readActiveIdentity();
}
