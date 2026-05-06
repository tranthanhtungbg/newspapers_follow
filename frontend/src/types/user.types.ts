// =============================================================
// LingoReader — User & Auth Types
// =============================================================

export type UserRole = 'GUEST' | 'USER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  sourceLang: string;
  targetLang: string;
  reminderTime?: string;
  reminderTz: string;
  streakCount: number;
  lastActive?: string;
  isActive: boolean;
  appearanceSettings: AppearanceSettings;
  createdAt: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  fontFamily: 'sans' | 'serif' | 'mono';
  lineHeight: 'snug' | 'normal' | 'relaxed' | 'loose';
  readingWidth: 'narrow' | 'normal' | 'wide';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  sourceLang?: string;
  targetLang?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
