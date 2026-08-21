'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Menu, Plus, Search, Settings2, X } from 'lucide-react';

import { useAuth } from '../components/auth-provider';
import { Sidebar, View } from '../components/sidebar';
import { ThemeToggle } from '../components/theme-toggle';
import { ProjectModal } from '../components/project-modal';
import { TaskCard } from '../components/task-card';
import { TaskModal } from '../components/task-modal';

import {
  Comment,
  Project,
  Task,
  Team,
  TaskStatus,
  User,
  commentApi,
  projectApi,
  taskApi,
  teamApi,
  usersApi,
} from '../lib/api';

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'completed', title: 'Completed' },
  { id: 'on-hold', title: 'On Hold' },
];

const accentOptions = [
  { name: 'Amber', value: '245 158 11' },
  { name: 'Blue', value: '59 130 246' },
  { name: 'Violet', value: '139 92 246' },
  { name: 'Emerald', value: '16 185 129' },
  { name: 'Rose', value: '244 63 94' },
  { name: 'Cyan', value: '6 182 212' },
];

export default function Home() {
  const {
    user,
    token,
    ready,
    login,
    register,
    guest,
    setUser,
  } = useAuth();

  const [view, setView] = useState<View>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedTask, setSelectedTask] = useState<
    Task | null | undefined
  >(undefined);

  const [selectedProject, setSelectedProject] = useState<
    Project | null | undefined
  >(undefined);

  const [comments, setComments] = useState<Comment[]>([]);

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [authForm, setAuthForm] = useState({
    name: '',
    email: 'demo@ablespace.dev',
    password: 'Demo@12345',
  });

  const [loading, setLoading] = useState(false);

  const [accent, setAccent] = useState('245 158 11');
  const [dark, setDark] = useState(false);

  /*
   * IMPORTANT:
   * All hooks are declared before any conditional return.
   * This prevents React's "change in the order of Hooks" error.
   */

  useEffect(() => {
    const savedAccent = localStorage.getItem('ablespace_accent');
    const savedTheme = localStorage.getItem('ablespace_theme');

    if (savedAccent) {
      setAccent(savedAccent);
      document.documentElement.style.setProperty(
        '--accent',
        savedAccent,
      );
    }

    const isDark = savedTheme === 'dark';

    setDark(isDark);

    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const loadWorkspace = useCallback(async () => {
    if (!token) return;

    try {
      setError('');

      const query = new URLSearchParams();

      if (search.trim()) {
        query.set('search', search.trim());
      }

      if (priority) {
        query.set('priority', priority);
      }

      if (statusFilter) {
        query.set('status', statusFilter);
      }

      const suffix = query.toString()
        ? `?${query.toString()}`
        : '';

      const [
        taskData,
        projectData,
        teamData,
        userData,
      ] = await Promise.all([
        taskApi.list(token, suffix),
        projectApi.list(token),
        teamApi.list(token),
        usersApi.list(token),
      ]);

      setTasks(taskData);
      setProjects(projectData);
      setTeams(teamData);
      setUsers(userData);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to load workspace',
      );
    }
  }, [priority, search, statusFilter, token]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!token || !selectedTask?._id) {
      setComments([]);
      return;
    }

    void commentApi
      .list(token, selectedTask._id)
      .then(setComments)
      .catch((e) =>
        setError(
          e instanceof Error
            ? e.message
            : 'Unable to load comments',
        ),
      );
  }, [selectedTask, token]);

  async function handleAuth(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        await login(authForm.email, authForm.password);
      } else {
        await register(
          authForm.name,
          authForm.email,
          authForm.password,
        );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Authentication failed',
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveTask(data: Partial<Task>) {
    if (!token) return;

    // Convert populated frontend objects to MongoDB IDs.
    const payload: Record<string, unknown> = { ...data };

    const assignee = data.assignee;
    if (assignee) {
      const id =
        typeof assignee === 'string'
          ? assignee
          : assignee._id ?? assignee.id;

      if (id) payload.assignee = id;
      else delete payload.assignee;
    } else {
      delete payload.assignee;
    }

    const project = data.project;
    if (project) {
      const id =
        typeof project === 'string'
          ? project
          : project._id;

      if (id) payload.project = id;
      else delete payload.project;
    } else {
      delete payload.project;
    }

    const team = (data as Partial<Task> & {
      team?: string | { _id?: string };
    }).team;

    if (team) {
      const id =
        typeof team === 'string'
          ? team
          : team._id;

      if (id) payload.team = id;
      else delete payload.team;
    } else {
      delete payload.team;
    }

    // These are populated/read-only frontend fields and are not
    // accepted by the backend task DTO.
    delete payload.subtasks;
    delete payload.reporter;

    if (selectedTask?._id) {
      await taskApi.update(
        token,
        selectedTask._id,
        payload as any,
      );
    } else {
      await taskApi.create(
        token,
        payload as any,
      );
    }

    setSelectedTask(undefined);
    await loadWorkspace();
  }

  async function deleteTask() {
    if (!token || !selectedTask?._id) return;

    if (!window.confirm('Delete this task?')) return;

    await taskApi.remove(token, selectedTask._id);

    setSelectedTask(undefined);

    await loadWorkspace();
  }

  async function saveProject(data: Partial<Project>) {
    if (!token) return;

    if (selectedProject?._id) {
      await projectApi.update(
        token,
        selectedProject._id,
        data,
      );
    } else {
      await projectApi.create(token, data);
    }

    await loadWorkspace();
  }

  async function deleteProject(id: string) {
    if (!token || !window.confirm('Delete this project?')) {
      return;
    }

    await projectApi.remove(token, id);

    await loadWorkspace();
  }

  async function addComment(content: string) {
    if (!token || !selectedTask?._id) return;

    const created = await commentApi.create(
      token,
      selectedTask._id,
      content,
    );

    setComments((prev) => [...prev, created]);
  }

  async function deleteComment(id: string) {
    if (!token || !selectedTask?._id) return;

    await commentApi.remove(
      token,
      selectedTask._id,
      id,
    );

    setComments((prev) =>
      prev.filter((comment) => comment._id !== id),
    );
  }

  function setAccentTheme(value: string) {
    setAccent(value);

    localStorage.setItem(
      'ablespace_accent',
      value,
    );

    document.documentElement.style.setProperty(
      '--accent',
      value,
    );
  }

  function toggleDark() {
    const next = !dark;

    setDark(next);

    localStorage.setItem(
      'ablespace_theme',
      next ? 'dark' : 'light',
    );

    document.documentElement.classList.toggle(
      'dark',
      next,
    );
  }

  /*
   * Conditional UI returns are AFTER all hooks.
   */

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-500">
        Loading AbleSpace…
      </div>
    );
  }

  if (!user || !token) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 md:p-8">
        <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 md:grid-cols-2">

          <div className="hidden bg-slate-950 p-12 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[rgb(var(--accent))] font-black">
                  A
                </div>

                <span className="text-xl font-bold">
                  AbleSpace
                </span>
              </div>

              <h1 className="max-w-md text-5xl font-bold leading-tight">
                Organize work. Move projects forward.
              </h1>

              <p className="mt-5 max-w-md text-slate-400">
                Tasks, projects, teams and focused
                collaboration in one workspace.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              Demo account: demo@ablespace.dev / Demo@12345
            </div>
          </div>

          <div className="flex items-center justify-center p-7 md:p-12">
            <form
              onSubmit={handleAuth}
              className="w-full max-w-sm"
            >
              <h2 className="text-3xl font-bold">
                {authMode === 'login'
                  ? 'Welcome back'
                  : 'Create account'}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {authMode === 'login'
                  ? 'Sign in to your AbleSpace workspace.'
                  : 'Start your AbleSpace workspace.'}
              </p>

              {error && (
                <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="mt-7 space-y-4">

                {authMode === 'register' && (
                  <input
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({
                        ...authForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Full name"
                    className="field"
                  />
                )}

                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="Email"
                  className="field"
                />

                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      password: e.target.value,
                    })
                  }
                  placeholder="Password"
                  className="field"
                />

                <button
                  disabled={loading}
                  className="w-full rounded-xl bg-[rgb(var(--accent))] py-3 font-semibold text-white disabled:opacity-60"
                >
                  {loading
                    ? 'Please wait…'
                    : authMode === 'login'
                      ? 'Sign in'
                      : 'Create account'}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setError('');

                    try {
                      await guest();
                    } catch (e) {
                      setError(
                        e instanceof Error
                          ? e.message
                          : 'Guest login failed',
                      );
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 py-3 font-semibold dark:border-slate-700"
                >
                  Continue as guest
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAuthMode(
                      authMode === 'login'
                        ? 'register'
                        : 'login',
                    )
                  }
                  className="w-full py-2 text-sm font-semibold text-[rgb(var(--accent))]"
                >
                  {authMode === 'login'
                    ? 'Need an account? Register'
                    : 'Already have an account? Sign in'}
                </button>

              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }

  /*
   * No hook below this point.
   * Stats are simple calculations, so useMemo is unnecessary.
   */

  const stats = {
    total: tasks.length,
    active: tasks.filter(
      (task) => task.status === 'doing',
    ).length,
    completed: tasks.filter(
      (task) => task.status === 'completed',
    ).length,
    urgent: tasks.filter(
      (task) => task.priority === 'urgent',
    ).length,
  };

  const workspace =
    view === 'board' || view === 'list' ? (
      <section>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              {view === 'board' ? 'Tasks' : 'Task List'}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Plan, prioritize and move work forward.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-slate-400"
                size={17}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search tasks…"
                className="field w-56 pl-9"
              />
            </div>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              className="field w-auto"
            >
              <option value="">
                All priorities
              </option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="field w-auto"
            >
              <option value="">
                All status
              </option>

              {columns.map((column) => (
                <option
                  key={column.id}
                  value={column.id}
                >
                  {column.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Add task
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          <Stat
            label="Total tasks"
            value={stats.total}
          />

          <Stat
            label="In progress"
            value={stats.active}
          />

          <Stat
            label="Completed"
            value={stats.completed}
          />

          <Stat
            label="Urgent"
            value={stats.urgent}
          />
        </div>

        {view === 'board' ? (
          <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">

            {columns.map((column) => (
              <div
                key={column.id}
                className="min-h-[360px] rounded-2xl bg-slate-100/70 p-3 dark:bg-slate-800/50"
              >
                <div className="mb-3 flex items-center justify-between px-1">

                  <div className="font-semibold">
                    {column.title}
                  </div>

                  <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500 dark:bg-slate-800">
                    {
                      tasks.filter(
                        (task) =>
                          task.status === column.id,
                      ).length
                    }
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks
                    .filter(
                      (task) =>
                        task.status === column.id,
                    )
                    .map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onEdit={setSelectedTask}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">

                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-5 py-4">
                      Task
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Priority
                    </th>

                    <th className="px-5 py-4">
                      Project
                    </th>

                    <th className="px-5 py-4">
                      Assignee
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task._id}
                      onClick={() =>
                        setSelectedTask(task)
                      }
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {task.title}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {task.status.replace(
                          '-',
                          ' ',
                        )}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {task.priority}
                      </td>

                      <td className="px-5 py-4">
                        {task.project?.name ?? '—'}
                      </td>

                      <td className="px-5 py-4">
                        {task.assignee?.name ??
                          'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    ) : view === 'projects' ? (
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold">
              Projects
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track the work that matters.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedProject(null)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            New project
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {projects.map((project) => (
            <article
              key={project._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">

                <div>
                  <h3 className="font-bold">
                    {project.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {project.description ||
                      'No description'}
                  </p>
                </div>

                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {project.priority}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>
                  {project.members?.length ?? 0}{' '}
                  members · {project.status}
                </span>

                <span>
                  {project.lead?.name ?? 'No lead'}
                </span>
              </div>

              <div className="mt-5 flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedProject(project)
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void deleteProject(
                      project._id,
                    )
                  }
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>

              </div>
            </article>
          ))}
        </div>
      </section>
    ) : view === 'teams' ? (
      <TeamsSection
        teams={teams}
        users={users}
        token={token}
        onRefresh={loadWorkspace}
      />
    ) : view === 'profile' ? (
      <ProfileSection
        user={user}
        users={users}
        setUser={setUser}
        token={token}
      />
    ) : (
      <SettingsSection
        accent={accent}
        setAccent={setAccentTheme}
        dark={dark}
        toggleDark={toggleDark}
      />
    );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">

      <div className="hidden md:block">
        <Sidebar
          view={view}
          setView={setView}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden">

          <div className="h-full w-72">
            <Sidebar
              view={view}
              setView={setView}
              onNavigate={() =>
                setMobileOpen(false)
              }
            />
          </div>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setMobileOpen(false)
            }
            className="absolute right-4 top-4 rounded-xl bg-white p-2 dark:bg-slate-900"
          >
            <X />
          </button>
        </div>
      )}

      <main className="min-w-0 flex-1">

        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:px-8">

          <button
            type="button"
            className="md:hidden"
            onClick={() =>
              setMobileOpen(true)
            }
          >
            <Menu />
          </button>

          <div className="hidden text-sm text-slate-500 md:block">
            Workspace /{' '}
            <span className="font-semibold text-slate-800 dark:text-white">
              {view}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">

            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold">
                {user.name}
              </div>

              <div className="text-xs text-slate-400">
                {user.title ?? 'Member'}
              </div>
            </div>

            <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 font-bold text-amber-700">
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>
        </header>

        <div className="p-4 md:p-8">

          {error && (
            <div className="mb-5 flex items-center justify-between rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-300">
              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  setError('')
                }
              >
                ×
              </button>
            </div>
          )}

          {workspace}
        </div>
      </main>

      {selectedTask !== undefined && (
        <TaskModal
          task={selectedTask}
          users={users}
          projects={projects}
          comments={comments}
          currentUserId={
            user.id ?? user._id
          }
          onClose={() =>
            setSelectedTask(undefined)
          }
          onSave={saveTask}
          onDelete={
            selectedTask
              ? deleteTask
              : undefined
          }
          onAddComment={
            selectedTask
              ? addComment
              : undefined
          }
          onDeleteComment={
            selectedTask
              ? deleteComment
              : undefined
          }
        />
      )}

      {selectedProject !== undefined && (
        <ProjectModal
          project={selectedProject}
          users={users}
          onClose={() =>
            setSelectedProject(undefined)
          }
          onSave={saveProject}
        />
      )}

    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="text-xs font-medium text-slate-400">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}

function TeamsSection({
  teams,
  users,
  token,
  onRefresh,
}: {
  teams: Team[];
  users: User[];
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] =
    useState('');
  const [lead, setLead] = useState('');

  async function createTeam() {
    if (!name.trim()) return;

    await teamApi.create(token, {
      name: name.trim(),
      description,
      lead: lead ? ({ id: lead } as User) : undefined,
    });

    setName('');
    setDescription('');
    setLead('');

    await onRefresh();
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Teams
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Organize people around projects.
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_180px_auto] dark:border-slate-700 dark:bg-slate-900">

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="field"
          placeholder="Team name"
        />

        <input
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="field"
          placeholder="Description"
        />

        <select
          value={lead}
          onChange={(e) =>
            setLead(e.target.value)
          }
          className="field"
        >
          <option value="">
            No lead
          </option>

          {users.map((user) => (
            <option
              key={user.id ?? user._id}
              value={user.id ?? user._id}
            >
              {user.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() =>
            void createTeam()
          }
          className="rounded-xl bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
        >
          Create
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {teams.map((team) => (
          <article
            key={team._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <h3 className="font-bold">
              {team.name}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {team.description ||
                'No description'}
            </p>

            <div className="mt-5 text-sm text-slate-500">
              {team.members?.length ?? 0}{' '}
              members · Lead:{' '}
              {team.lead?.name ?? 'None'}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfileSection({
  user,
  users,
  setUser,
  token,
}: {
  user: User;
  users: User[];
  setUser: (user: User) => void;
  token: string;
}) {
  const [name, setName] = useState(
    user.name,
  );

  const [title, setTitle] = useState(
    user.title ?? '',
  );

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  async function save() {
    setSaving(true);
    setMessage('');

    try {
      const updated =
        await usersApi.update(
          token,
          user.id ?? user._id ?? '',
          {
            name,
            title,
          },
        );

      setUser({
        ...user,
        ...updated,
        id: updated.id ?? user.id,
      });

      setMessage('Profile saved.');
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : 'Unable to save',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-2xl">

      <h1 className="text-2xl font-bold">
        Profile
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Manage your workspace identity.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">

        <div className="grid gap-4">

          <label className="text-sm font-medium">
            Name

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="field"
            />
          </label>

          <label className="text-sm font-medium">
            Email

            <input
              value={user.email}
              disabled
              className="field opacity-60"
            />
          </label>

          <label className="text-sm font-medium">
            Title

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="field"
            />
          </label>

          <div className="text-sm text-slate-400">
            Role: {user.role ?? 'member'} ·
            Workspace members: {users.length}
          </div>

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="w-fit rounded-xl bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {saving
              ? 'Saving…'
              : 'Save profile'}
          </button>

          {message && (
            <div className="text-sm text-slate-500">
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SettingsSection({
  accent,
  setAccent,
  dark,
  toggleDark,
}: {
  accent: string;
  setAccent: (value: string) => void;
  dark: boolean;
  toggleDark: () => void;
}) {
  return (
    <section className="max-w-3xl">

      <div className="flex items-center gap-3">
        <Settings2 />

        <div>
          <h1 className="text-2xl font-bold">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Personalize your AbleSpace
            workspace.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">

          <h2 className="font-bold">
            Appearance
          </h2>

          <button
            type="button"
            onClick={toggleDark}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left dark:border-slate-700"
          >
            <span>
              <span className="block font-semibold">
                Dark mode
              </span>

              <span className="text-sm text-slate-500">
                Use a darker interface.
              </span>
            </span>

            <span
              className={`h-6 w-11 rounded-full p-1 ${
                dark
                  ? 'bg-[rgb(var(--accent))]'
                  : 'bg-slate-200'
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white transition ${
                  dark ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">

          <h2 className="font-bold">
            Accent theme
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

            {accentOptions.map((option) => (
              <button
                type="button"
                key={option.name}
                onClick={() =>
                  setAccent(option.value)
                }
                className={`rounded-xl border p-3 text-left ${
                  accent === option.value
                    ? 'border-slate-900 dark:border-white'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <span
                  className="mb-2 block h-7 rounded-lg"
                  style={{
                    backgroundColor: `rgb(${option.value})`,
                  }}
                />

                <span className="text-sm font-semibold">
                  {option.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}