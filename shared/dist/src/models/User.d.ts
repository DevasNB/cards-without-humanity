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
export declare const createUserSchema: z.ZodObject<{
    username: z.ZodString;
}, z.core.$strip>;
export declare const loginUserSchema: z.ZodObject<{
    username: z.ZodString;
}, z.core.$strip>;
export type CreateUserRequestBody = z.infer<typeof createUserSchema>;
export type LoginUserRequestBody = z.infer<typeof loginUserSchema>;
export type EnterAnoynmousRequestBody = z.infer<typeof createUserSchema>;
