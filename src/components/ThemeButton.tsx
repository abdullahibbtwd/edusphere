'use client'
import { FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeButton() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-14 h-8 rounded-full bg-muted flex items-center px-1 transition-colors"></div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative cursor-pointer w-14 h-8 rounded-full flex items-center px-1 transition-colors duration-500 
                 bg-primary shadow-lg overflow-hidden"
      title="Toggle Theme"
    >
      <span
        className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-surface 
                    transition-all duration-500 ease-in-out transform bg-primary-400 
                    ${isDark ? 'translate-x-6 ' : 'translate-x-0 '}`}
      >
        {isDark ? <FiMoon size={16} /> : <FiSun size={16} />}
      </span>
    </button>
  );
}
