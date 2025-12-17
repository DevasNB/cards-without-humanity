// Define a clean, strict return type
export type Cookies = Record<string, string> | { empty: true };

/**
 * Parses a raw 'Cookie' header string into an object.
 *
 * @param rawCookies - The raw cookie header string (e.g. "a=1; b=2")
 * @returns An object with cookie key-value pairs, or { empty: true } if no cookies exist.
 */
export const getCookies = (rawCookies?: string): Cookies => {
  if (!rawCookies) return { empty: true };

  const cookies: Record<string, string> = {};

  for (const cookie of rawCookies.split(";")) {
    const [key, ...rest] = cookie.trim().split("=");
    if (key) {
      cookies[key] = rest.join("="); // supports '=' inside cookie values
    }
  }

  return Object.keys(cookies).length > 0 ? cookies : { empty: true };
};
