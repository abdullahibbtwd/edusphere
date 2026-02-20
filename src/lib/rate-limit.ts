/**
 * Rate Limiting Utility using Sliding Window Algorithm
 * 
 * This utility provides in-memory rate limiting for API endpoints.
 * Note: This implementation resets on server restart. For production
 * deployments with multiple instances, consider using Redis/Upstash.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

class RateLimiter {
    private requests: Map<string, RateLimitEntry> = new Map();
    private limit: number;
    private windowMs: number;
    private cleanupInterval: NodeJS.Timeout;

    constructor(limit: number, windowMs: number = 60000) {
        this.limit = limit;
        this.windowMs = windowMs;

        // Cleanup expired entries every 60 seconds
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);
    }

    /**
     * Check if the identifier has exceeded the rate limit
     * @param identifier - Unique identifier (e.g., IP address, school ID)
     * @returns Object with success status, remaining requests, and reset time
     */
    check(identifier: string): {
        success: boolean;
        remaining: number;
        resetAt: Date;
        retryAfter?: number;
    } {
        const now = Date.now();
        const entry = this.requests.get(identifier);

        // If no entry or entry has expired, create new entry
        if (!entry || now > entry.resetAt) {
            const resetAt = now + this.windowMs;
            this.requests.set(identifier, {
                count: 1,
                resetAt,
            });

            return {
                success: true,
                remaining: this.limit - 1,
                resetAt: new Date(resetAt),
            };
        }

        // Check if limit exceeded
        if (entry.count >= this.limit) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            return {
                success: false,
                remaining: 0,
                resetAt: new Date(entry.resetAt),
                retryAfter,
            };
        }

        // Increment count
        entry.count++;
        this.requests.set(identifier, entry);

        return {
            success: true,
            remaining: this.limit - entry.count,
            resetAt: new Date(entry.resetAt),
        };
    }

    /**
     * Clean up expired entries
     */
    private cleanup() {
        const now = Date.now();
        for (const [identifier, entry] of this.requests.entries()) {
            if (now > entry.resetAt) {
                this.requests.delete(identifier);
            }
        }
    }

    /**
     * Clear all entries (useful for testing)
     */
    clear() {
        this.requests.clear();
    }

    /**
     * Destroy the rate limiter and cleanup interval
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.requests.clear();
    }
}

// Create rate limiter instances for different endpoints
export const loginIpLimiter = new RateLimiter(5, 60000); // 5 requests per minute
export const loginSchoolLimiter = new RateLimiter(10, 60000); // 10 requests per minute
export const otpLimiter = new RateLimiter(3, 60000); // 3 requests per minute
export const registerLimiter = new RateLimiter(5, 60000); // 5 requests per minute
export const resultUploadLimiter = new RateLimiter(20, 60000); // 20 requests per minute

/**
 * Extract IP address from request headers
 * Checks multiple headers in order of priority:
 * 1. x-forwarded-for (most common in production)
 * 2. x-real-ip (used by some proxies)
 * 3. x-client-ip (alternative header)
 */
export function getClientIp(request: Request): string {
    // Get headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = request.headers.get('x-client-ip');

    // x-forwarded-for can contain multiple IPs, get the first one
    if (forwardedFor) {
        const ips = forwardedFor.split(',');
        return ips[0].trim();
    }

    // Return whichever header is available
    if (realIp) return realIp;
    if (clientIp) return clientIp;

    // Fallback to unknown (should rarely happen)
    return 'unknown';
}

/**
 * Create a standardized rate limit error response
 */
export function createRateLimitResponse(retryAfter: number, message?: string) {
    return Response.json(
        {
            error: message || 'Too many requests. Please try again later.',
            retryAfter,
        },
        {
            status: 429,
            headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': '0',
                'X-RateLimit-Remaining': '0',
            },
        }
    );
}
