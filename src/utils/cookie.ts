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

export function setCookie(key: string, value: string) {
  if (!document) {
    return false;
  }

  const { cookie } = document;
  const cookiePairs = cookie
    .split(";")
    .filter((pair) => pair.length !== 0 && !pair.trim().startsWith(key));

  const hasValue = value.length !== 0;
  if (hasValue) {
    const targetKeyValue = hasValue ? `${key}=${value}` : "";
    cookiePairs.push(targetKeyValue);
  }
  document.cookie = `${cookiePairs.join(";")}`;
}
