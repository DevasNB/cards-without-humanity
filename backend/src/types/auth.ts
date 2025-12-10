// src/types/auth.d.ts
import { UserRole } from "@prisma/client";
import { UserResponse as UR } from "cah-shared";
import { z } from "zod";

// Define the Zod schema for creating a user
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username must be at most 30 characters long." })
    .regex(/^\w+$/, {
      message: "Username must be alphanumeric and can include underscores.",
    }),
});

export const loginUserSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
});

// Infer the TypeScript type from the Zod schema, when creating a new user
export type CreateUserRequestBody = z.infer<typeof createUserSchema>;
export type LoginUserRequestBody = z.infer<typeof loginUserSchema>;
export type EnterAnoynmousRequestBody = z.infer<typeof createUserSchema>;

// Interface for the response when a user is successfully created
export interface UserResponse extends UR {}

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
