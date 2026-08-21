'use client';

import type { LucideIcon } from 'lucide-react';
import { FolderKanban, LayoutDashboard, ListTodo, LogOut, Settings, UserRound, Users } from 'lucide-react';
import { useAuth } from './auth-provider';

export type View = 'board' | 'list' | 'projects' | 'teams' | 'profile' | 'settings';

type SidebarProps = { view: View; setView: (view: View) => void; onNavigate?: () => void };

type NavItem = { id: View; label: string; icon: LucideIcon };

const items: NavItem[] = [
  { id: 'board', label: 'Tasks', icon: LayoutDashboard },
  { id: 'list', label: 'Task List', icon: ListTodo },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ view, setView, onNavigate }: SidebarProps) {
  const { logout } = useAuth();
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--accent))] font-black text-white">A</div>
        <div><div className="font-bold">AbleSpace</div><div className="text-xs text-slate-400">Task management</div></div>
      </div>
      <nav className="space-y-1">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => { setView(id); onNavigate?.(); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${view === id ? 'bg-amber-50 text-amber-700 dark:bg-slate-800 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
            <Icon size={18} />{label}
          </button>
        ))}
      </nav>
      <button type="button" onClick={logout} className="mt-auto flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/30">
        <LogOut size={18} />Logout
      </button>
    </aside>
  );
}
