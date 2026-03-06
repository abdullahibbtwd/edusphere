'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ThemeButton from '../ThemeButton';
import { Menu } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { logout } from '@/lib/client-auth';

const FALLBACK_AVATAR = '/avatar.png';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const avatarSrc = avatarError || !user?.imageUrl ? FALLBACK_AVATAR : user.imageUrl;

  useEffect(() => {
    setAvatarError(false);
  }, [user?.imageUrl]);

  const handleLogout = async () => {
    try {
      const ok = await logout();
      if (ok) refreshUser();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
      refreshUser();
      router.push('/');
    }
  };

  return (
    <div className="h-16 bg-surface text-text flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 bg-surface rounded-lg shadow-lg border border-border hover:bg-bg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-text" />
        </button>
        <span className="text-2xl font-bold font-poppins cursor-default">Dashboard</span>
      </div>

      <div className="relative flex gap-2 items-center">
        <ThemeButton />
        <button
          className="flex items-center gap-2 hover:scale-105 cursor-pointer duration-300 ease-in-out transition-all border-2 rounded-full p-0.5 hover:bg-primary/10 overflow-hidden"
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="Profile menu"
        >
          <Image
            src={avatarSrc}
            alt="Profile"
            width={36}
            height={36}
            className="rounded-full w-9 h-9 object-cover"
            unoptimized={avatarSrc.startsWith('http')}
            onError={() => setAvatarError(true)}
          />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-32 w-40 text-white bg-red-700 rounded-lg shadow-lg py-2">
            <button
              onClick={handleLogout}
              className="w-full cursor-pointer text-left px-4 py-2 hover:bg-primary/10 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
