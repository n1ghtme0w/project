export interface User {
  id: string;
  username: string; // Изменено с email на username
  email: string;
  firstName: string; // Добавлено имя
  lastName: string; // Добавлена фамилия
  patronymic?: string; // Добавлено отчество (необязательно)
  password: string; // Добавлен пароль для хранения
  role: 'admin' | 'user';
  avatar?: string; // Добавлен аватар
  createdAt: string;
  boardIds: string[]; // Доски, к которым пользователь имеет доступ
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'created' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigneeIds: string[]; // Множественное назначение пользователей
  creatorId: string;
  boardId: string;
  deadline?: string;
  isPinned: boolean;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  code: string; // Уникальный код доски
  createdBy: string;
  memberIds: string[]; // Участники доски
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  boards: Board[];
  currentBoardId: string | null;
  isAuthenticated: boolean;
  savedCredentials: { username: string; password: string } | null; // Сохраненные данные для автозаполнения
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  createdTasks: number;
}