'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check current theme status
    if (typeof window !== 'undefined') {
      const isDarkTheme = document.documentElement.classList.contains('dark');
      setIsDark(isDarkTheme);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setIsDark(false);
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setIsDark(true);
      }
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
      aria-label="Alternar modo escuro"
    >
      {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
