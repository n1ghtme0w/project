export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sharedWith?: string[]; // Массив ID пользователей, с которыми поделились доской
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'created' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assigneeId: string; // Для обратной совместимости
  assigneeIds?: string[]; // Множественное назначение
  creatorId: string;
  boardId: string;
  deadline?: string;
  isPinned: boolean;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  boards: Board[];
  currentBoardId: string | null;
  isAuthenticated: boolean;
}