import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Task, Board } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType extends AppState {
  login: (username: string, password: string, boardCode?: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    patronymic?: string;
  }, boardCode?: string) => Promise<boolean>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskPin: (taskId: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'boardIds'>) => Promise<{ success: boolean; message: string }>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addBoard: (board: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'memberIds'>) => void;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (boardId: string) => void;
  getCurrentBoardTasks: () => Task[];
  joinBoardByCode: (boardCode: string) => Promise<boolean>;
  generateBoardLink: (boardId: string) => string;
  clearSavedCredentials: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  currentUser: null,
  users: [],
  tasks: [],
  boards: [],
  currentBoardId: null,
  isAuthenticated: false,
  savedCredentials: null,
};

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_CURRENT_BOARD'; payload: string }
  | { type: 'SET_SAVED_CREDENTIALS'; payload: { username: string; password: string } | null }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: { id: string; updates: Partial<Board> } }
  | { type: 'DELETE_BOARD'; payload: string };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
      };
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    case 'SET_BOARDS':
      return {
        ...state,
        boards: action.payload,
      };
    case 'SET_CURRENT_BOARD':
      return {
        ...state,
        currentBoardId: action.payload,
      };
    case 'SET_SAVED_CREDENTIALS':
      return {
        ...state,
        savedCredentials: action.payload,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
      };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload.id 
          ? { ...state.currentUser, ...action.payload.updates }
          : state.currentUser,
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    case 'ADD_BOARD':
      return {
        ...state,
        boards: [...state.boards, action.payload],
      };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.id
            ? { ...board, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : board
        ),
      };
    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [storedUsers, setStoredUsers] = useLocalStorage<User[]>('planify-users', []);
  const [storedTasks, setStoredTasks] = useLocalStorage<Task[]>('planify-tasks', []);
  const [storedBoards, setStoredBoards] = useLocalStorage<Board[]>('planify-boards', []);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('planify-current-user', null);
  const [currentBoardId, setCurrentBoardId] = useLocalStorage<string | null>('planify-current-board', null);
  const [savedCredentials, setSavedCredentials] = useLocalStorage<{ username: string; password: string } | null>('planify-saved-credentials', null);

  // Генерация уникального кода доски
  const generateBoardCode = (): string => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  // Инициализация с демо данными, если пусто
  useEffect(() => {
    if (storedUsers.length === 0) {
      const demoUsers: User[] = [
        {
          id: '1',
          username: 'admin123',
          email: 'admin@planify.com',
          firstName: 'АДМИНИСТРАТОР',
          lastName: 'СИСТЕМЫ',
          password: 'password123',
          role: 'admin',
          createdAt: new Date().toISOString(),
          boardIds: ['1'],
        },
        {
          id: '2',
          username: 'user1234',
          email: 'user@planify.com',
          firstName: 'ОБЫЧНЫЙ',
          lastName: 'ПОЛЬЗОВАТЕЛЬ',
          password: 'password123',
          role: 'user',
          createdAt: new Date().toISOString(),
          boardIds: ['1'],
        },
      ];
      setStoredUsers(demoUsers);
      dispatch({ type: 'SET_USERS', payload: demoUsers });
    } else {
      dispatch({ type: 'SET_USERS', payload: storedUsers });
    }

    if (storedBoards.length === 0) {
      const demoBoards: Board[] = [
        {
          id: '1',
          name: 'ОСНОВНАЯ ДОСКА',
          description: 'ГЛАВНАЯ ДОСКА ДЛЯ УПРАВЛЕНИЯ ЗАДАЧАМИ',
          code: 'DEMO2024',
          createdBy: '1',
          memberIds: ['1', '2'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setStoredBoards(demoBoards);
      dispatch({ type: 'SET_BOARDS', payload: demoBoards });
      if (!currentBoardId) {
        setCurrentBoardId('1');
        dispatch({ type: 'SET_CURRENT_BOARD', payload: '1' });
      }
    } else {
      dispatch({ type: 'SET_BOARDS', payload: storedBoards });
      if (currentBoardId) {
        dispatch({ type: 'SET_CURRENT_BOARD', payload: currentBoardId });
      }
    }

    if (storedTasks.length === 0) {
      const demoTasks: Task[] = [
        {
          id: '1',
          title: 'ДИЗАЙН ПОЛЬЗОВАТЕЛЬСКОГО ИНТЕРФЕЙСА',
          description: 'СОЗДАТЬ МАКЕТЫ И ПРОТОТИПЫ ДЛЯ НОВОЙ ФУНКЦИИ',
          status: 'in-progress',
          priority: 'high',
          assigneeIds: ['2'],
          creatorId: '1',
          boardId: '1',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isPinned: true,
          attachments: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'РЕАЛИЗАЦИЯ АУТЕНТИФИКАЦИИ',
          description: 'НАСТРОИТЬ СИСТЕМУ ВХОДА И РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЕЙ',
          status: 'created',
          priority: 'high',
          assigneeIds: ['1'],
          creatorId: '1',
          boardId: '1',
          isPinned: false,
          attachments: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setStoredTasks(demoTasks);
      dispatch({ type: 'SET_TASKS', payload: demoTasks });
    } else {
      dispatch({ type: 'SET_TASKS', payload: storedTasks });
    }

    // Проверка существующего входа
    if (currentUserId) {
      const user = storedUsers.find(u => u.id === currentUserId);
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
      }
    }

    // Загрузка сохраненных данных для автозаполнения
    if (savedCredentials) {
      dispatch({ type: 'SET_SAVED_CREDENTIALS', payload: savedCredentials });
    }
  }, []);

  // Синхронизация с localStorage
  useEffect(() => {
    setStoredUsers(state.users);
  }, [state.users, setStoredUsers]);

  useEffect(() => {
    setStoredTasks(state.tasks);
  }, [state.tasks, setStoredTasks]);

  useEffect(() => {
    setStoredBoards(state.boards);
  }, [state.boards, setStoredBoards]);

  useEffect(() => {
    if (state.currentBoardId) {
      setCurrentBoardId(state.currentBoardId);
    }
  }, [state.currentBoardId, setCurrentBoardId]);

  // Извлечение кода доски из ссылки
  const extractBoardCodeFromLink = (link: string): string | null => {
    try {
      const url = new URL(link);
      const boardCode = url.searchParams.get('board');
      return boardCode;
    } catch {
      return null;
    }
  };

  // Генерация ссылки на доску
  const generateBoardLink = (boardId: string): string => {
    const board = state.boards.find(b => b.id === boardId);
    if (!board) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}?board=${board.code}`;
  };

  // Присоединение к доске по коду
  const joinBoardByCode = async (boardCode: string): Promise<boolean> => {
    if (!boardCode) return false;

    const board = state.boards.find(b => b.code === boardCode);
    if (!board) return false;

    // Добавляем пользователя в доску, если его там нет
    if (state.currentUser && !state.currentUser.boardIds.includes(board.id)) {
      const updatedUser = {
        ...state.currentUser,
        boardIds: [...state.currentUser.boardIds, board.id]
      };
      
      const updatedBoard = {
        ...board,
        memberIds: [...board.memberIds, state.currentUser.id]
      };

      dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, updates: updatedUser } });
      dispatch({ type: 'UPDATE_BOARD', payload: { id: board.id, updates: updatedBoard } });
    }

    dispatch({ type: 'SET_CURRENT_BOARD', payload: board.id });
    return true;
  };

  const login = async (username: string, password: string, boardCode?: string): Promise<boolean> => {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      setCurrentUserId(user.id);
      
      // Сохранение данных для автозаполнения
      const credentials = { username, password };
      setSavedCredentials(credentials);
      dispatch({ type: 'SET_SAVED_CREDENTIALS', payload: credentials });
      
      // Если предоставлен код доски, попытаться присоединиться
      if (boardCode) {
        await joinBoardByCode(boardCode);
      } else {
        // Устанавливаем первую доступную доску
        if (user.boardIds.length > 0) {
          dispatch({ type: 'SET_CURRENT_BOARD', payload: user.boardIds[0] });
        }
      }
      
      return true;
    }
    return false;
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    patronymic?: string;
  }, boardCode?: string): Promise<boolean> => {
    const existingUser = state.users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      return false;
    }

    let boardIds: string[] = [];
    
    // Если предоставлен код доски, проверяем его существование
    if (boardCode) {
      const board = state.boards.find(b => b.code === boardCode);
      if (board) {
        boardIds = [board.id];
      }
    }

    // Если нет доступных досок, создаем новую
    if (boardIds.length === 0) {
      const newBoardId = (Date.now() + 1).toString();
      const newBoard: Board = {
        id: newBoardId,
        name: `ДОСКА ${userData.firstName.toUpperCase()} ${userData.lastName.toUpperCase()}`,
        description: `ПЕРСОНАЛЬНАЯ ДОСКА ДЛЯ ${userData.firstName.toUpperCase()} ${userData.lastName.toUpperCase()}`,
        code: generateBoardCode(),
        createdBy: Date.now().toString(),
        memberIds: [Date.now().toString()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_BOARD', payload: newBoard });
      boardIds = [newBoardId];
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName.toUpperCase(),
      lastName: userData.lastName.toUpperCase(),
      patronymic: userData.patronymic?.toUpperCase(),
      password: userData.password,
      role: 'admin', // Новые пользователи становятся администраторами
      createdAt: new Date().toISOString(),
      boardIds,
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    dispatch({ type: 'LOGIN', payload: newUser });
    setCurrentUserId(newUser.id);
    
    // Сохранение данных для автозаполнения
    const credentials = { username: userData.username, password: userData.password };
    setSavedCredentials(credentials);
    dispatch({ type: 'SET_SAVED_CREDENTIALS', payload: credentials });
    
    // Устанавливаем текущую доску
    if (boardIds.length > 0) {
      dispatch({ type: 'SET_CURRENT_BOARD', payload: boardIds[0] });
    }
    
    return true;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    setCurrentUserId(null);
  };

  const clearSavedCredentials = () => {
    setSavedCredentials(null);
    dispatch({ type: 'SET_SAVED_CREDENTIALS', payload: null });
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      boardId: taskData.boardId || state.currentBoardId || '1',
      assigneeIds: taskData.assigneeIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, updates } });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTaskPin = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isPinned: !task.isPinned });
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'boardIds'>): Promise<{ success: boolean; message: string }> => {
    const existingUserByEmail = state.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    const existingUserByUsername = state.users.find(u => u.username.toLowerCase() === userData.username.toLowerCase());
    
    if (existingUserByEmail) {
      return { success: false, message: 'ПОЛЬЗОВАТЕЛЬ С ТАКИМ EMAIL УЖЕ СУЩЕСТВУЕТ' };
    }
    
    if (existingUserByUsername) {
      return { success: false, message: 'ПОЛЬЗОВАТЕЛЬ С ТАКИМ ИМЕНЕМ ПОЛЬЗОВАТЕЛЯ УЖЕ СУЩЕСТВУЕТ' };
    }

    const newUser: User = {
      ...userData,
      firstName: userData.firstName.toUpperCase(),
      lastName: userData.lastName.toUpperCase(),
      patronymic: userData.patronymic?.toUpperCase(),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      boardIds: state.currentBoardId ? [state.currentBoardId] : [],
    };
    
    dispatch({ type: 'ADD_USER', payload: newUser });
    
    // Добавляем пользователя в текущую доску
    if (state.currentBoardId) {
      const currentBoard = state.boards.find(b => b.id === state.currentBoardId);
      if (currentBoard) {
        const updatedBoard = {
          ...currentBoard,
          memberIds: [...currentBoard.memberIds, newUser.id]
        };
        dispatch({ type: 'UPDATE_BOARD', payload: { id: state.currentBoardId, updates: updatedBoard } });
      }
    }
    
    return { success: true, message: 'ПОЛЬЗОВАТЕЛЬ УСПЕШНО СОЗДАН' };
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const updatedUser = { ...updates };
    if (updatedUser.firstName) {
      updatedUser.firstName = updatedUser.firstName.toUpperCase();
    }
    if (updatedUser.lastName) {
      updatedUser.lastName = updatedUser.lastName.toUpperCase();
    }
    if (updatedUser.patronymic) {
      updatedUser.patronymic = updatedUser.patronymic.toUpperCase();
    }
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, updates: updatedUser } });
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (state.currentUser) {
      updateUser(state.currentUser.id, updates);
    }
  };

  const deleteUser = (userId: string) => {
    dispatch({ type: 'DELETE_USER', payload: userId });
  };

  const addBoard = (boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'memberIds'>) => {
    const newBoard: Board = {
      ...boardData,
      name: boardData.name.toUpperCase(),
      description: boardData.description?.toUpperCase(),
      id: Date.now().toString(),
      code: generateBoardCode(),
      memberIds: [state.currentUser?.id || ''],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_BOARD', payload: newBoard });
    
    // Добавляем доску в список досок пользователя
    if (state.currentUser) {
      const updatedUser = {
        ...state.currentUser,
        boardIds: [...state.currentUser.boardIds, newBoard.id]
      };
      dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, updates: updatedUser } });
    }
  };

  const updateBoard = (boardId: string, updates: Partial<Board>) => {
    const updatedBoard = { ...updates };
    if (updatedBoard.name) {
      updatedBoard.name = updatedBoard.name.toUpperCase();
    }
    if (updatedBoard.description) {
      updatedBoard.description = updatedBoard.description.toUpperCase();
    }
    dispatch({ type: 'UPDATE_BOARD', payload: { id: boardId, updates: updatedBoard } });
  };

  const deleteBoard = (boardId: string) => {
    // Проверяем, может ли пользователь удалить эту доску
    const board = state.boards.find(b => b.id === boardId);
    if (!board) return;
    
    const canDelete = state.currentUser?.role === 'admin' || 
      (board.createdBy === state.currentUser?.id && state.boards.length > 1);
    
    if (!canDelete) {
      alert('ВЫ НЕ МОЖЕТЕ УДАЛИТЬ ЭТУ ДОСКУ');
      return;
    }
    
    dispatch({ type: 'DELETE_BOARD', payload: boardId });
    
    // Удаляем доску из списков пользователей
    state.users.forEach(user => {
      if (user.boardIds.includes(boardId)) {
        const updatedBoardIds = user.boardIds.filter(id => id !== boardId);
        dispatch({ type: 'UPDATE_USER', payload: { id: user.id, updates: { boardIds: updatedBoardIds } } });
      }
    });
    
    // Переключаемся на другую доску, если текущая была удалена
    if (state.currentBoardId === boardId) {
      const remainingBoards = state.boards.filter(b => b.id !== boardId);
      if (remainingBoards.length > 0) {
        dispatch({ type: 'SET_CURRENT_BOARD', payload: remainingBoards[0].id });
      }
    }
  };

  const setCurrentBoard = (boardId: string) => {
    dispatch({ type: 'SET_CURRENT_BOARD', payload: boardId });
  };

  const getCurrentBoardTasks = () => {
    return state.tasks.filter(task => task.boardId === state.currentBoardId);
  };

  const value: AppContextType = {
    ...state,
    savedCredentials,
    login,
    register,
    logout,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskPin,
    addUser,
    updateUser,
    updateCurrentUser,
    deleteUser,
    addBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    getCurrentBoardTasks,
    joinBoardByCode,
    generateBoardLink,
    clearSavedCredentials,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}