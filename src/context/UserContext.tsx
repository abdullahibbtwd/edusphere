'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserSession, getUserSession } from '@/lib/client-auth';

interface UserContextType {
    user: UserSession | null;
    role: string;
    loading: boolean;
    refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(() => {
        const session = getUserSession();
        setUser(session);
        setLoading(false);
    }, []);

    useEffect(() => {
        refreshUser();

        // Optional: Listen for cookie changes or storage events if needed
        // For now, simple initialization is enough as per requirements
    }, [refreshUser]);

    const value = {
        user,
        role: (user?.role || '').toLowerCase(),
        loading,
        refreshUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
