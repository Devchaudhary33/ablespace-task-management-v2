'use client';

import { CalendarDays, MoreHorizontal, UserRound } from 'lucide-react';
import { Task } from '../lib/api';

const priorityClasses: Record<Task['priority'], string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300',
  high: 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-300',
  urgent: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300',
};

export function TaskCard({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <button type="button" onClick={() => onEdit(task)} className="text-left font-semibold leading-5 hover:text-[rgb(var(--accent))]">{task.title}</button>
        <button type="button" aria-label="Open task" onClick={() => onEdit(task)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><MoreHorizontal size={18} /></button>
      </div>
      {task.description && <p className="mb-3 line-clamp-2 text-sm text-slate-500">{task.description}</p>}
      <div className="mb-3 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses[task.priority]}`}>{task.priority}</span>
        {(task.labels ?? []).slice(0, 2).map(label => <span key={label} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 dark:bg-slate-800">{label}</span>)}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex max-w-[60%] items-center gap-1 truncate">{task.assignee ? <><UserRound size={14} />{task.assignee.name}</> : 'Unassigned'}</span>
        {task.dueDate && <span className="flex items-center gap-1"><CalendarDays size={14} />{new Date(task.dueDate).toLocaleDateString()}</span>}
      </div>
    </article>
  );
}
