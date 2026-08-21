'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Project, User } from '../lib/api';

type Props = { project?: Project | null; users: User[]; onClose: () => void; onSave: (data: Partial<Project>) => Promise<void> };

export function ProjectModal({ project, users, onClose, onSave }: Props) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [priority, setPriority] = useState<Project['priority']>(project?.priority ?? 'medium');
  const [status, setStatus] = useState<Project['status']>(project?.status ?? 'active');
  const [lead, setLead] = useState(project?.lead?.id ?? project?.lead?._id ?? '');
  const [dueDate, setDueDate] = useState(project?.dueDate ? project.dueDate.slice(0, 10) : '');

  useEffect(() => { setName(project?.name ?? ''); setDescription(project?.description ?? ''); setPriority(project?.priority ?? 'medium'); setStatus(project?.status ?? 'active'); setLead(project?.lead?.id ?? project?.lead?._id ?? ''); setDueDate(project?.dueDate ? project.dueDate.slice(0, 10) : ''); }, [project]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    const selectedLead = lead ? users.find(user => (user.id ?? user._id) === lead) : undefined;

    await onSave({
      name: name.trim(),
      description,
      priority,
      status,
      lead: selectedLead,
      dueDate: dueDate || undefined,
    });

    onClose();
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-bold">{project ? 'Edit project' : 'Create project'}</h2><p className="text-sm text-slate-500">Keep project scope and ownership clear.</p></div><button type="button" onClick={onClose}><X /></button></div><div className="space-y-4"><label className="block text-sm font-medium">Name<input value={name} onChange={e => setName(e.target.value)} className="field" autoFocus /></label><label className="block text-sm font-medium">Description<textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="field resize-none" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Status<select value={status} onChange={e => setStatus(e.target.value as Project['status'])} className="field"><option value="planning">Planning</option><option value="active">Active</option><option value="completed">Completed</option><option value="on-hold">On hold</option></select></label><label className="block text-sm font-medium">Priority<select value={priority} onChange={e => setPriority(e.target.value as Project['priority'])} className="field"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label className="block text-sm font-medium">Lead<select value={lead} onChange={e => setLead(e.target.value)} className="field"><option value="">No lead</option>{users.map(u => <option key={u.id ?? u._id} value={u.id ?? u._id}>{u.name}</option>)}</select></label><label className="block text-sm font-medium">Due date<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="field" /></label></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500">Cancel</button><button className="rounded-xl bg-[rgb(var(--accent))] px-5 py-2 text-sm font-semibold text-white">Save project</button></div></form></div>;
}
