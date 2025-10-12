// src/types/auth.d.ts
import { z } from "zod";

// Define the Zod schema for creating a user
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username must be at most 30 characters long." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username must be alphanumeric and can include underscores.",
    }),
});

// Infer the TypeScript type from the Zod schema, when creating a new user
export type CreateUserRequestBody = z.infer<typeof createUserSchema>;

// Interface for the response when a user is successfully created
export interface UserResponse {
  id: string;
  username: string;
  role: "ANONYMOUS" | "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}
