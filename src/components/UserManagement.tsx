import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  User as UserIcon,
  Edit,
  Trash2,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

export function UserManagement() {
  const { users, currentUser, addUser, updateUser, deleteUser, getCurrentBoardTasks } = useApp();
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
  });
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tasks = getCurrentBoardTasks();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(ru|com|org|net|edu|gov|mil|int|info|biz|name|museum|coop|aero|[a-z]{2})$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(formData.email)) {
      setError('ПОЖАЛУЙСТА, ВВЕДИТЕ КОРРЕКТНЫЙ EMAIL АДРЕС (НАПРИМЕР: USER@EXAMPLE.COM)');
      return;
    }
    
    if (editingUser) {
      // Проверка дубликатов при редактировании (исключая текущего пользователя)
      const existingUserByEmail = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUser.id);
      const existingUserByName = users.find(u => u.name.toLowerCase() === formData.name.toLowerCase() && u.id !== editingUser.id);
      
      if (existingUserByEmail) {
        setError('ПОЛЬЗОВАТЕЛЬ С ТАКИМ EMAIL УЖЕ СУЩЕСТВУЕТ');
        return;
      }
      
      if (existingUserByName) {
        setError('ПОЛЬЗОВАТЕЛЬ С ТАКИМ ИМЕНЕМ УЖЕ СУЩЕСТВУЕТ');
        return;
      }
      
      updateUser(editingUser.id, formData);
      setEditingUser(null);
      setShowAddUser(false);
    } else {
      const result = await addUser(formData);
      if (!result.success) {
        setError(result.message.toUpperCase());
        return;
      }
      setShowAddUser(false);
    }
    
    setFormData({ name: '', email: '', role: 'user' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowAddUser(true);
    setError('');
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('ВЫ НЕ МОЖЕТЕ УДАЛИТЬ СВОЙ СОБСТВЕННЫЙ АККАУНТ.');
      return;
    }
    
    if (window.confirm(`ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ${user.name.toUpperCase()}?`)) {
      deleteUser(user.id);
    }
  };

  const getUserTaskStats = (userId: string) => {
    const userTasks = tasks.filter(task => task.assigneeIds?.includes(userId) || task.assigneeId === userId);
    return {
      total: userTasks.length,
      completed: userTasks.filter(task => task.status === 'completed').length,
      inProgress: userTasks.filter(task => task.status === 'in-progress').length,
    };
  };

  const cancelEdit = () => {
    setShowAddUser(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'user' });
    setError('');
  };

  // Мобильная версия - список пользователей
  if (isMobile) {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 uppercase">ПОЛЬЗОВАТЕЛИ</h2>
          </div>
          
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center space-x-1 text-gray-800 px-3 py-2 rounded-xl font-medium uppercase text-sm"
            style={{ backgroundColor: '#CFE8FF' }}
          >
            <UserPlus className="w-4 h-4" />
            <span>ДОБАВИТЬ</span>
          </button>
        </div>

        {/* Форма добавления/редактирования пользователя */}
        {showAddUser && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4 uppercase">
              {editingUser ? 'РЕДАКТИРОВАТЬ' : 'ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ'}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  ПОЛНОЕ ИМЯ
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors"
                  placeholder="ВВЕДИТЕ ПОЛНОЕ ИМЯ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  EMAIL АДРЕС
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors"
                  placeholder="ВВЕДИТЕ EMAIL АДРЕС"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  РОЛЬ
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors uppercase"
                >
                  <option value="user">ПОЛЬЗОВАТЕЛЬ</option>
                  <option value="admin">АДМИНИСТРАТОР</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="text-gray-800 px-6 py-2 rounded-xl font-medium uppercase"
                  style={{ backgroundColor: '#CFE8FF' }}
                >
                  {editingUser ? 'ОБНОВИТЬ' : 'ДОБАВИТЬ'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-100 transition-colors font-medium uppercase"
                >
                  ОТМЕНА
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Список пользователей */}
        <div className="space-y-3">
          {users.map((user) => {
            const stats = getUserTaskStats(user.id);
            const isCurrentUser = user.id === currentUser?.id;
            
            return (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center space-x-2">
                        <span className="uppercase">{user.name}</span>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-1 rounded-full uppercase" style={{ backgroundColor: '#CFE8FF', color: '#1e40af' }}>
                            ВЫ
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? (
                          <Crown className="w-3 h-3" />
                        ) : (
                          <UserIcon className="w-3 h-3" />
                        )}
                        <span className="uppercase">
                          {user.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="uppercase">{stats.total} ВСЕГО ЗАДАЧ</div>
                        <div className="text-green-600 uppercase">{stats.completed} ВЫПОЛНЕНО</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Десктопная версия - таблица
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 uppercase">УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</h2>
          <span className="text-blue-700 px-3 py-1 rounded-full text-sm font-medium uppercase" style={{ backgroundColor: '#CFE8FF' }}>
            {users.length} ПОЛЬЗОВАТЕЛЕЙ
          </span>
        </div>
        
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center space-x-2 text-gray-800 px-4 py-2 rounded-xl font-medium uppercase"
          style={{ backgroundColor: '#CFE8FF' }}
        >
          <UserPlus className="w-5 h-5" />
          <span>ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ</span>
        </button>
      </div>

      {/* Форма добавления/редактирования пользователя */}
      {showAddUser && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">
            {editingUser ? 'РЕДАКТИРОВАТЬ ПОЛЬЗОВАТЕЛЯ' : 'ДОБАВИТЬ НОВОГО ПОЛЬЗОВАТЕЛЯ'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                ПОЛНОЕ ИМЯ
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors"
                placeholder="ВВЕДИТЕ ПОЛНОЕ ИМЯ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                EMAIL АДРЕС
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors"
                placeholder="ВВЕДИТЕ EMAIL АДРЕС"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                РОЛЬ
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors uppercase"
              >
                <option value="user">ПОЛЬЗОВАТЕЛЬ</option>
                <option value="admin">АДМИНИСТРАТОР</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center space-x-3">
              <button
                type="submit"
                className="text-gray-800 px-6 py-2 rounded-xl font-medium uppercase"
                style={{ backgroundColor: '#CFE8FF' }}
              >
                {editingUser ? 'ОБНОВИТЬ ПОЛЬЗОВАТЕЛЯ' : 'ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-100 transition-colors font-medium uppercase"
              >
                ОТМЕНА
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица пользователей */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200" style={{ backgroundColor: '#cfd7ff' }}>
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">ПОЛЬЗОВАТЕЛЬ</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">EMAIL</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">РОЛЬ</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">СТАТИСТИКА ЗАДАЧ</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">ДАТА РЕГИСТРАЦИИ</th>
                <th className="text-right py-4 px-6 font-medium text-gray-700 uppercase">ДЕЙСТВИЯ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const stats = getUserTaskStats(user.id);
                const isCurrentUser = user.id === currentUser?.id;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center space-x-2">
                            <span className="uppercase">{user.name}</span>
                            {isCurrentUser && (
                              <span className="text-xs px-2 py-1 rounded-full uppercase" style={{ backgroundColor: '#CFE8FF', color: '#1e40af' }}>
                                ВЫ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{user.email}</td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          <UserIcon className="w-4 h-4" />
                        )}
                        <span className="uppercase">
                          {user.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">
                        <div className="uppercase">{stats.total} ВСЕГО</div>
                        <div className="text-xs text-green-600 uppercase">{stats.completed} ВЫПОЛНЕНО</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}