export function buildPostHref(slug: string) {
  return `/posts/${encodeURIComponent(slug)}`;
}
