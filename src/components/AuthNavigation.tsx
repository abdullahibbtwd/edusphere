'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession, isAuthenticated } from '@/lib/client-auth';

interface AuthNavigationProps {
    className?: string; // Allow custom styling passed from parent
    mobile?: boolean;   // Simplified view for mobile
}

export default function AuthNavigation({ className, mobile = false }: AuthNavigationProps) {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isAuthenticated()) {
            setIsAuth(true);
            const session = getUserSession();
            if (session) {
                setRole(session.role);
            }
        }
    }, []);

    // Avoid hydration mismatch by rendering nothing until mounted on client
    if (!mounted) {
        return (
            <button
                className={`${className} opacity-70 cursor-not-allowed`}
            >
                Login/Sign Up
            </button>
        );
    }

    if (isAuth) {
        if (role === 'SUPER_ADMIN') {
            return (
                <button
                    onClick={() => router.push('/dashboard')}
                    className={`${className}`}
                >
                    Dashboard
                </button>
            );
        } else {
            // Authenticated but NOT Super Admin
            return (
                <button
                    onClick={() => router.push('/schoolApplication')}
                    className={`${className}`}
                >
                    Apply
                </button>
            );
        }
    }

    // Not Authenticated
    return (
        <button
            onClick={() => router.push('/auth')}
            className={`${className}`}
        >
            Login/Sign Up
        </button>
    );
}
