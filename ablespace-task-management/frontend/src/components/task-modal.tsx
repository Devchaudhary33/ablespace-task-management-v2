'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { MessageCircle, Trash2, X } from 'lucide-react';
import { Comment, Project, Task, User } from '../lib/api';

export type TaskSaveData = Partial<Task>;

type TaskModalProps = {
  task?: Task | null;
  users: User[];
  projects: Project[];
  comments: Comment[];
  currentUserId?: string;
  onClose: () => void;
  onSave: (data: TaskSaveData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onAddComment?: (content: string) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
};

export function TaskModal({ task, users, projects, comments, currentUserId, onClose, onSave, onDelete, onAddComment, onDeleteComment }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority ?? 'medium');
  const [status, setStatus] = useState<Task['status']>(task?.status ?? 'todo');
  const [assignee, setAssignee] = useState(task?.assignee?._id ?? '');
  const [project, setProject] = useState(task?.project?._id ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [labels, setLabels] = useState((task?.labels ?? []).join(', '));
  const [subtasks, setSubtasks] = useState((task?.subtasks ?? []).map(item => ({ ...item })));
  const [newSubtask, setNewSubtask] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(task?.title ?? ''); setDescription(task?.description ?? ''); setPriority(task?.priority ?? 'medium'); setStatus(task?.status ?? 'todo');
    setAssignee(task?.assignee?._id ?? ''); setProject(task?.project?._id ?? ''); setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : ''); setLabels((task?.labels ?? []).join(', ')); setSubtasks((task?.subtasks ?? []).map(item => ({ ...item }))); setNewSubtask('');
  }, [task]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const selectedAssignee = assignee ? users.find(user => (user.id ?? user._id) === assignee) : undefined;
      await onSave({
        title: title.trim(),
        description,
        priority,
        status,
        assignee: selectedAssignee,
        project: project ? projects.find(projectItem => projectItem._id === project) : undefined,
        dueDate: dueDate || undefined,
        labels: labels.split(',').map(v => v.trim()).filter(Boolean),
        subtasks,
      });
      onClose();
    } finally { setSaving(false); }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim() || !onAddComment) return;
    await onAddComment(comment.trim());
    setComment('');
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 grid w-full max-w-4xl gap-4 lg:grid-cols-[1fr_330px]">
        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-bold">{task ? 'Edit task' : 'Create task'}</h2><p className="text-sm text-slate-500">Keep the work clear and actionable.</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button></div>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Title<input value={title} onChange={e => setTitle(e.target.value)} className="field" placeholder="e.g. Finalize dashboard" autoFocus /></label>
            <label className="block text-sm font-medium">Description<textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="field resize-none" placeholder="What needs to be done?" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Status<select value={status} onChange={e => setStatus(e.target.value as Task['status'])} className="field"><option value="todo">To Do</option><option value="doing">Doing</option><option value="completed">Completed</option><option value="on-hold">On Hold</option></select></label>
              <label className="block text-sm font-medium">Priority<select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className="field"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
              <label className="block text-sm font-medium">Assignee<select value={assignee} onChange={e => setAssignee(e.target.value)} className="field"><option value="">Unassigned</option>{users.map(u => <option key={u.id ?? u._id} value={u.id ?? u._id}>{u.name}</option>)}</select></label>
              <label className="block text-sm font-medium">Project<select value={project} onChange={e => setProject(e.target.value)} className="field"><option value="">No project</option>{projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
              <label className="block text-sm font-medium">Due date<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="field" /></label>
              <label className="block text-sm font-medium">Labels<input value={labels} onChange={e => setLabels(e.target.value)} className="field" placeholder="design, launch" /></label>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">Subtasks</span><span className="text-xs text-slate-400">{subtasks.filter(item => item.completed).length}/{subtasks.length} done</span></div>
              <div className="space-y-2">
                {subtasks.map((item, index) => <div key={item._id ?? index} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800"><input type="checkbox" checked={item.completed} onChange={e => setSubtasks(prev => prev.map((entry, i) => i === index ? { ...entry, completed: e.target.checked } : entry))} /><input value={item.title} onChange={e => setSubtasks(prev => prev.map((entry, i) => i === index ? { ...entry, title: e.target.value } : entry))} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><button type="button" onClick={() => setSubtasks(prev => prev.filter((_, i) => i !== index))} className="text-xs text-red-500">Remove</button></div>)}
                <div className="flex gap-2"><input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const value = newSubtask.trim(); if (value) { setSubtasks(prev => [...prev, { title: value, completed: false }]); setNewSubtask(''); } } }} className="field" placeholder="Add a subtask and press Enter" /><button type="button" onClick={() => { const value = newSubtask.trim(); if (value) { setSubtasks(prev => [...prev, { title: value, completed: false }]); setNewSubtask(''); } }} className="rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-slate-700">Add</button></div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <div>{task && onDelete && <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={16} /> Delete</button>}</div>
            <div className="flex gap-3"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button><button disabled={saving} className="rounded-xl bg-[rgb(var(--accent))] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save task'}</button></div>
          </div>
        </form>

        {task && <section className="rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2 font-semibold"><MessageCircle size={18} /> Comments <span className="text-xs text-slate-400">{comments.length}</span></div>
          <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">
            {comments.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No comments yet.</p>}
            {comments.map(c => <div key={c._id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><div className="flex items-center justify-between text-xs text-slate-400"><span className="font-semibold text-slate-600 dark:text-slate-200">{c.author?.name ?? 'User'}</span>{(c.author?.id ?? c.author?._id) === currentUserId && onDeleteComment && <button type="button" onClick={() => onDeleteComment(c._id)} className="text-red-500">Delete</button>}</div><p className="mt-2 text-sm leading-5">{c.content}</p></div>)}
          </div>
          {onAddComment && <form onSubmit={submitComment} className="mt-4 flex gap-2"><input value={comment} onChange={e => setComment(e.target.value)} className="field" placeholder="Write a comment…" /><button className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Post</button></form>}
        </section>}
      </div>
    </div>
  );
}
