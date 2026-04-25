export function normalizeSlug(value: string): string {
  return value.normalize("NFKC");
}

export function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeRouteSlug(value: string): string {
  return normalizeSlug(decodeSlug(value));
}

export function encodeSlugPathSegment(value: string): string {
  return encodeURIComponent(normalizeSlug(value));
}
