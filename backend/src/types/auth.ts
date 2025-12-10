// src/types/auth.d.ts
import { UserRole } from "@prisma/client";
import { UserResponse } from "cah-shared";

// --- JWT Payload ---
// This interface defines the data that will be stored inside the JWT
export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
}

// Interface for the response when a user is successfully created or logged in
export interface AuthResponse {
  user: UserResponse;
  token: string; // The generated JWT
}
