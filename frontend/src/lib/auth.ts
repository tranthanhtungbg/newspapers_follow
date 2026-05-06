// =============================================================
// LingoReader — Auth Helpers
// Both access token and refresh token stored in localStorage
// =============================================================

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
}

export function clearTokensLocally(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

/**
 * Exchange refresh token for new tokens.
 */
export async function refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (!res.ok) throw new Error('Refresh failed');

  const body = await res.json();
  const tokens = body.data?.tokens || body.tokens; // Fallback depending on API wrapper
  setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

/**
 * Clear all client-side tokens and call logout endpoint to revoke refresh token.
 */
export async function clearTokens(): Promise<void> {
  const accessToken = getAccessToken();
  clearTokensLocally();
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
    });
  } catch {
    // Best-effort logout
  }
}

/** Check if access token is expired (JWT decode without verify) */
export function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
