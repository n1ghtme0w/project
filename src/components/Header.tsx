import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Users,
  LogOut,
  Bell,
  Plus,
  LayoutGrid,
  ChevronDown,
  Folder,
  FolderPlus,
  BarChart3,
  Trash2,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BoardModal } from './BoardModal';

interface HeaderProps {
  currentView: 'board' | 'calendar' | 'users' | 'analytics';
  onViewChange: (view: 'board' | 'calendar' | 'users' | 'analytics') => void;
  onCreateTask: () => void;
}

export function Header({ currentView, onViewChange, onCreateTask }: HeaderProps) {
  const { currentUser, logout, boards, currentBoardId, setCurrentBoard, getCurrentBoardTasks, deleteBoard, generateBoardLink } = useApp();
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tasks = getCurrentBoardTasks();
  const pendingTasks = tasks.filter(task => task.status !== 'completed').length;
  const currentBoard = boards.find(board => board.id === currentBoardId);

  // Фильтрация досок для текущего пользователя
  const userBoards = boards.filter(board => {
    if (currentUser?.role === 'admin') {
      return true; // Админ видит все доски
    }
    return board.createdBy === currentUser?.id; // Пользователь видит только свои доски
  });

  const handleBoardChange = (boardId: string) => {
    setCurrentBoard(boardId);
    setShowBoardDropdown(false);
  };

  const handleDeleteBoard = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    
    if (window.confirm(`ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ДОСКУ "${board.name.toUpperCase()}"?`)) {
      deleteBoard(boardId);
    }
  };

  const handleShareBoard = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = generateBoardLink(boardId);
    navigator.clipboard.writeText(link).then(() => {
      alert('ССЫЛКА НА ДОСКУ СКОПИРОВАНА В БУФЕР ОБМЕНА');
    }).catch(() => {
      prompt('СКОПИРУЙТЕ ССЫЛКУ НА ДОСКУ:', link);
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-8 flex-1 min-w-0">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 uppercase">KANBANPRO</h1>
              <p className="text-xs md:text-sm text-gray-500 uppercase">{pendingTasks} АКТИВНЫХ ЗАДАЧ</p>
            </div>
          </div>

          {/* Селектор досок */}
          <div className="relative flex-1 max-w-xs">
            <button
              onClick={() => setShowBoardDropdown(!showBoardDropdown)}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-colors w-full text-left"
              style={{ backgroundColor: '#CCCCFF' }}
            >
              <Folder className="w-3 h-3 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
              <span className="font-medium text-gray-900 uppercase truncate text-sm md:text-base">
                {currentBoard?.name || 'ВЫБЕРИТЕ ДОСКУ'}
              </span>
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            </button>

            {showBoardDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full md:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                    ДОСКИ
                  </div>
                  {userBoards.map(board => (
                    <div key={board.id} className="group">
                      <div
                        className={`flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer ${
                          board.id === currentBoardId ? 'text-blue-700' : 'text-gray-700'
                        }`}
                        style={board.id === currentBoardId ? { backgroundColor: '#CFE8FF' } : {}}
                        onClick={() => handleBoardChange(board.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium uppercase truncate text-sm">{board.name}</div>
                          {board.description && (
                            <div className="text-xs text-gray-500 truncate uppercase">{board.description}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleShareBoard(board.id, e)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="ПОДЕЛИТЬСЯ ДОСКОЙ"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                          {(currentUser?.role === 'admin' || board.createdBy === currentUser?.id) && userBoards.length > 1 && (
                            <button
                              onClick={(e) => handleDeleteBoard(board.id, e)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="УДАЛИТЬ ДОСКУ"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      setShowBoardModal(true);
                      setShowBoardDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-blue-600 flex items-center space-x-2"
                  >
                    <FolderPlus className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="uppercase text-sm">СОЗДАТЬ НОВУЮ ДОСКУ</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onViewChange('board')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'board'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="uppercase">ДОСКА</span>
            </button>
            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="uppercase">КАЛЕНДАРЬ</span>
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'analytics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="uppercase">АНАЛИТИКА</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onViewChange('users')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'users'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="uppercase">ПОЛЬЗОВАТЕЛИ</span>
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          <button
            onClick={onCreateTask}
            className="flex items-center space-x-1 md:space-x-2 text-gray-800 px-3 md:px-4 py-2 rounded-lg transition-all font-medium"
            style={{ backgroundColor: '#CCCCFF' }}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline uppercase text-sm md:text-base">СОЗДАТЬ ЗАДАЧУ</span>
          </button>

          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs md:text-sm font-medium text-gray-900 uppercase">{currentUser?.name}</div>
              <div className="text-xs text-gray-500 uppercase">{currentUser?.role}</div>
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-xs md:text-sm">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Мобильная навигация */}
      <nav className="md:hidden flex items-center space-x-1 mt-4 bg-gray-50 rounded-lg p-1 overflow-x-auto">
        <button
          onClick={() => onViewChange('board')}
          className={`flex-shrink-0 flex items-center justify-center space-x-1 py-2 px-3 rounded-md font-medium transition-colors ${
            currentView === 'board'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-xs uppercase">ДОСКА</span>
        </button>
        <button
          onClick={() => onViewChange('calendar')}
          className={`flex-shrink-0 flex items-center justify-center space-x-1 py-2 px-3 rounded-md font-medium transition-colors ${
            currentView === 'calendar'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-xs uppercase">КАЛЕНДАРЬ</span>
        </button>
        <button
          onClick={() => onViewChange('analytics')}
          className={`flex-shrink-0 flex items-center justify-center space-x-1 py-2 px-3 rounded-md font-medium transition-colors ${
            currentView === 'analytics'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-xs uppercase">АНАЛИТИКА</span>
        </button>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onViewChange('users')}
            className={`flex-shrink-0 flex items-center justify-center space-x-1 py-2 px-3 rounded-md font-medium transition-colors ${
              currentView === 'users'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase">ПОЛЬЗОВАТЕЛИ</span>
          </button>
        )}
      </nav>

      <BoardModal
        isOpen={showBoardModal}
        onClose={() => setShowBoardModal(false)}
      />
    </header>
  );
}