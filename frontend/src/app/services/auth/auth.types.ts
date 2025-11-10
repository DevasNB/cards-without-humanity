// src/app/services/auth/auth.types.ts

// Mirror backend's Zod schema for request bodies
export interface CreateUserRequestBody {
  username: string;
}

export interface LoginUserRequestBody {
  username: string;
}

// Mirror your backend's UserRole enum
export type UserRole = 'ANONYMOUS' | 'USER' | 'ADMIN';

// Mirror your backend's UserResponse
export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
