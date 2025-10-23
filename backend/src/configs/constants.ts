import dotenv from "dotenv";
dotenv.config();
import type { StringValue } from "ms";

if (typeof process.env.JWT_SECRET !== "string") {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1); // Exit process if critical env var is missing
}

const validDurationPattern = /^\d+[smhdy]$/;
// Examples of valid values: "30s", "15m", "1h", "7d", "1y"

if (
  typeof process.env.JWT_EXPIRES_IN !== "string" ||
  !validDurationPattern.test(process.env.JWT_EXPIRES_IN.trim())
) {
  console.error(
    `FATAL ERROR: JWT_EXPIRES_IN is not defined or not a valid duration string.
Valid formats include: "30s", "15m", "1h", "7d", "1y".`
  );
  process.exit(1);
}

if (typeof process.env.FRONTEND_URL !== "string") {
  console.error("FATAL ERROR: FRONTEND_URL is not defined.");
  process.exit(1);
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as StringValue;
export const PORT = process.env.PORT || 3000;
export const FRONTEND_URL = process.env.FRONTEND_URL;
