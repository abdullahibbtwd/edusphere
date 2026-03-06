'use client';

export interface UserSession {
    userId: string;
    name: string | null;
    email: string;
    role: string;
    imageUrl: string | null;
    schoolId: string | null;
    schoolName?: string;
    schoolSubdomain?: string;
}

/**
 * Get user session from cookie (client-side)
 */
export function getUserSession(): UserSession | null {
    if (typeof window === 'undefined') return null;

    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user-session='));

    if (!cookie) return null;

    try {
        const value = cookie.split('=')[1];
        return JSON.parse(decodeURIComponent(value));
    } catch (error) {
        console.error('Error parsing user session:', error);
        return null;
    }
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
    return getUserSession() !== null;
}

/**
 * Check if user has a specific role (client-side)
 */
export function hasRole(role: string): boolean {
    const session = getUserSession();
    return session?.role === role;
}

/**
 * Check if user has any of the specified roles (client-side)
 */
export function hasAnyRole(roles: string[]): boolean {
    const session = getUserSession();
    return session ? roles.includes(session.role) : false;
}

/**
 * Logout function (client-side).
 * Only calls the API and clears the cookie; does not redirect.
 * Callers should then call refreshUser() from UserContext and redirect (e.g. router.push).
 */
export async function logout(): Promise<boolean> {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });
        if (response.ok) return true;
        console.error('Logout failed');
        return false;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
}
