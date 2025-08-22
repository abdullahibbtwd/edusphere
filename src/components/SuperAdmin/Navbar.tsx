'use client';

import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import ThemeButton from '../ThemeButton';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Add your logout logic here (e.g., clearing auth tokens)
    console.log('Logged out');
    router.push('/login');
  };

  return (
    <div className="h-16 bg-surface text-text flex items-center justify-between px-6 sticky top-0 z-20">
      <span className="text-2xl font-bold font-poppins cursor-default">Dashboard</span>

      <div className="relative flex gap-2 items-center">
        <ThemeButton/>
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
