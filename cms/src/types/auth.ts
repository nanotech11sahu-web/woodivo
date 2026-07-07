export type UserRole = 'super_admin' | 'admin' | 'editor';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
