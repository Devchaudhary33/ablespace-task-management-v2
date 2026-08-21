const API =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const TOKEN_KEY = 'ablespace_token';
const LEGACY_TOKEN_KEY = 'accessToken';

type ApiOptions = RequestInit & {
  token?: string;
};

function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem('ablespace_user');
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  const data: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    clearStoredAuth();
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data
        ? (data as { message?: string | string[] }).message
        : undefined;

    throw new Error(
      Array.isArray(message)
        ? message.join(', ')
        : message ?? 'Request failed',
    );
  }

  return data as T;
}

// ============================================================
// Types
// ============================================================

export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  title?: string;
  avatar?: string;
  role?: string;
};

export type TaskStatus =
  | 'todo'
  | 'doing'
  | 'completed'
  | 'on-hold';

export type Priority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

// ============================================================
// Task Response Type
// ============================================================

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;

  assignee?: User;
  reporter?: User;

  dueDate?: string;

  labels?: string[];
  resources?: string[];

  project?: {
    _id: string;
    name: string;
  };

  subtasks?: {
    _id?: string;
    title: string;
    completed: boolean;
  }[];
};

// ============================================================
// Task Request Types
// ============================================================

export type CreateTaskData = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;

  // Backend expects MongoDB ObjectId strings
  assignee?: string;
  project?: string;
  team?: string;

  dueDate?: string;
  labels?: string[];
  resources?: string[];
};

export type UpdateTaskData = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;

  // Backend expects MongoDB ObjectId strings
  assignee?: string;
  project?: string;
  team?: string;

  dueDate?: string;
  labels?: string[];
  resources?: string[];
};

// ============================================================
// Project Types
// ============================================================

export type Project = {
  _id: string;
  name: string;
  description?: string;
  priority: Priority;

  status:
    | 'planning'
    | 'active'
    | 'completed'
    | 'on-hold';

  lead?: User;
  members?: User[];
  dueDate?: string;
};

// ============================================================
// Team Types
// ============================================================

export type Team = {
  _id: string;
  name: string;
  description?: string;
  lead?: User;
  members?: User[];
};

// ============================================================
// Comment Types
// ============================================================

export type Comment = {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
};

// ============================================================
// Auth API
// ============================================================

export const authApi = {
  login: (
    email: string,
    password: string,
  ) =>
    api<{
      accessToken: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  guest: () =>
    api<{
      accessToken: string;
      user: User;
    }>('/auth/guest', {
      method: 'POST',
    }),

  register: (
    name: string,
    email: string,
    password: string,
  ) =>
    api<{
      accessToken: string;
      user: User;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }),
};

// ============================================================
// Tasks API
// ============================================================

export const taskApi = {
  list: (
    token: string,
    query = '',
  ) =>
    api<Task[]>(
      `/tasks${query}`,
      {
        token,
      },
    ),

  get: (
    token: string,
    id: string,
  ) =>
    api<Task>(
      `/tasks/${id}`,
      {
        token,
      },
    ),

  create: (
    token: string,
    data: CreateTaskData,
  ) =>
    api<Task>(
      '/tasks',
      {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      },
    ),

  update: (
    token: string,
    id: string,
    data: UpdateTaskData,
  ) =>
    api<Task>(
      `/tasks/${id}`,
      {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      },
    ),

  remove: (
    token: string,
    id: string,
  ) =>
    api<{ message: string }>(
      `/tasks/${id}`,
      {
        method: 'DELETE',
        token,
      },
    ),
};

// ============================================================
// Projects API
// ============================================================

export const projectApi = {
  list: (
    token: string,
  ) =>
    api<Project[]>(
      '/projects',
      {
        token,
      },
    ),

  get: (
    token: string,
    id: string,
  ) =>
    api<Project>(
      `/projects/${id}`,
      {
        token,
      },
    ),

  create: (
    token: string,
    data: Partial<Project>,
  ) =>
    api<Project>(
      '/projects',
      {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      },
    ),

  update: (
    token: string,
    id: string,
    data: Partial<Project>,
  ) =>
    api<Project>(
      `/projects/${id}`,
      {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      },
    ),

  remove: (
    token: string,
    id: string,
  ) =>
    api<{ message: string }>(
      `/projects/${id}`,
      {
        method: 'DELETE',
        token,
      },
    ),
};

// ============================================================
// Teams API
// ============================================================

export const teamApi = {
  list: (
    token: string,
  ) =>
    api<Team[]>(
      '/teams',
      {
        token,
      },
    ),

  create: (
    token: string,
    data: Partial<Team>,
  ) =>
    api<Team>(
      '/teams',
      {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      },
    ),

  update: (
    token: string,
    id: string,
    data: Partial<Team>,
  ) =>
    api<Team>(
      `/teams/${id}`,
      {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      },
    ),

  remove: (
    token: string,
    id: string,
  ) =>
    api<{ message: string }>(
      `/teams/${id}`,
      {
        method: 'DELETE',
        token,
      },
    ),
};

// ============================================================
// Users API
// ============================================================

export const usersApi = {
  list: (
    token: string,
  ) =>
    api<User[]>(
      '/users',
      {
        token,
      },
    ),

  update: (
    token: string,
    id: string,
    data: Partial<User>,
  ) =>
    api<User>(
      `/users/${id}`,
      {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      },
    ),
};

// ============================================================
// Comments API
// ============================================================

export const commentApi = {
  list: (
    token: string,
    taskId: string,
  ) =>
    api<Comment[]>(
      `/tasks/${taskId}/comments`,
      {
        token,
      },
    ),

  create: (
    token: string,
    taskId: string,
    content: string,
  ) =>
    api<Comment>(
      `/tasks/${taskId}/comments`,
      {
        method: 'POST',
        token,
        body: JSON.stringify({
          content,
        }),
      },
    ),

  remove: (
    token: string,
    taskId: string,
    id: string,
  ) =>
    api<{ message: string }>(
      `/tasks/${taskId}/comments/${id}`,
      {
        method: 'DELETE',
        token,
      },
    ),
};