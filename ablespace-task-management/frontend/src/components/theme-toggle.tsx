'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);
  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('ablespace_theme', next ? 'dark' : 'light');
    setDark(next);
  }
  return <button type="button" onClick={toggle} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
