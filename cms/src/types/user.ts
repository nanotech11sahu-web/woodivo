import type { UserRole } from './auth';
import type { EntityStatus } from './common';

// Backend's UserStatus is its own enum (`active`/`inactive`), not the
// content-module `status` field — but the values line up exactly, so this
// stays an alias of the shared EntityStatus rather than a redeclaration.
export type UserStatus = EntityStatus;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
