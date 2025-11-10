export const parseCookies = (cookieHeader: string): Record<string, string> => {
  const cookies: Record<string, string> = {};

  for (const cookie of cookieHeader.split(";")) {
    const [key, value] = cookie.trim().split("=");
    cookies[key] = decodeURIComponent(value);
  }

  return cookies;
};
