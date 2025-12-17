import { UserRole } from '../enums/UserRole';
import { z } from 'zod';

export interface SimplifiedUser {
  id: string;
  username: string;
}

export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Zod schema for creating a user
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .max(30, { message: 'Username must be at most 30 characters long.' })
    .regex(/^\w+$/, {
      message: 'Username must be alphanumeric and can include underscores.',
    }),
});

export const loginUserSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
});

// Infer the TypeScript type from the Zod schema, when creating a new user
export type CreateUserRequestBody = z.infer<typeof createUserSchema>;
export type LoginUserRequestBody = z.infer<typeof loginUserSchema>;
export type EnterAnoynmousRequestBody = z.infer<typeof createUserSchema>;
