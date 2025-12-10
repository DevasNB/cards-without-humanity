// src/app/services/auth/auth.types.ts
import { UserResponse as UR } from 'cah-shared';

// Mirror backend's Zod schema for request bodies
export interface CreateUserRequestBody {
  username: string;
}

export interface LoginUserRequestBody {
  username: string;
}

// Mirror your backend's UserResponse
export interface UserResponse extends UR {}
