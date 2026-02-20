import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

export interface JWTPayload {
    userId: string;
    email: string;
    name: string | null;
    role: string;
    schoolId: string | null;
    imageUrl: string | null;
}

/**
 * Create a JWT token with user data
 */
export function createToken(payload: JWTPayload): string {
    try {
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        return token;
    } catch (error) {
        console.error('Error creating token:', error);
        throw new Error('Failed to create authentication token');
    }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.error('Invalid token');
        } else {
            console.error('Token verification error:', error);
        }
        return null;
    }
}

/**
 * Get cookie options for setting auth cookie
 */
export function getCookieOptions(maxAge: number = 7 * 24 * 60 * 60) {
    return {
        httpOnly: true, // Prevent JavaScript access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax' as const, // CSRF protection
        maxAge: maxAge, // 7 days in seconds
        path: '/', // Available across the entire site
    };
}
