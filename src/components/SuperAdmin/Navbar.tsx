'use client';

import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import ThemeButton from '../ThemeButton';
import { Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
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
          className="flex items-center gap-2 hover:scale-105 cursor-pointer duration-300 ease-in-out transition-all border-2 rounded-full p-2  hover:bg-primary/10 "
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FiUser size={24} />
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
