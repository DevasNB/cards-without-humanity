import { UserRole } from "../enums/UserRole";

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
