export function getCookieValue(cookie: string | undefined, key: string) {
  if (!cookie) {
    return null;
  }

  const cookiePairs = cookie.split(";");
  const target = cookiePairs.find((pair) => pair.trim().startsWith(key));

  if (!target) {
    return null;
  }
  const value = target.split("=")[1];

  return value ?? null;
}

export function setCookie(
  key: string,
  value: string,
  options?: { maxAge?: number },
) {
  if (!document) {
    return false;
  }

  let cookieString = `${key}=${value}; path=/; SameSite=Lax`;
  if (options?.maxAge !== undefined) {
    cookieString += `; Max-Age=${options.maxAge}`;
  }
  document.cookie = cookieString;
}
