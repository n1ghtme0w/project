import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, CheckCircle2, Link } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [boardLink, setBoardLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, joinBoardByLink } = useApp();

  // Валидация пароля
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8 || password.length > 20) {
      return { isValid: false, message: 'ПАРОЛЬ ДОЛЖЕН СОДЕРЖАТЬ ОТ 8 ДО 20 СИМВОЛОВ' };
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return { isValid: false, message: 'ПАРОЛЬ ДОЛЖЕН СОДЕРЖАТЬ ТОЛЬКО АНГЛИЙСКИЕ БУКВЫ И ЦИФРЫ' };
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      return { isValid: false, message: 'ПАРОЛЬ ДОЛЖЕН СОДЕРЖАТЬ ХОТЯ БЫ ОДНУ БУКВУ' };
    }
    
    return { isValid: true, message: '' };
  };

  // Валидация email
  const validateEmail = (email: string): { isValid: boolean; message: string } => {
    if (email.length < 8 || email.length > 20) {
      return { isValid: false, message: 'EMAIL ДОЛЖЕН СОДЕРЖАТЬ ОТ 8 ДО 20 СИМВОЛОВ' };
    }
    
    if (!/^[a-zA-Z0-9@.]+$/.test(email)) {
      return { isValid: false, message: 'EMAIL ДОЛЖЕН СОДЕРЖАТЬ ТОЛЬКО АНГЛИЙСКИЕ БУКВЫ, ЦИФРЫ И СИМВОЛЫ @ .' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Валидация email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.message);
        setLoading(false);
        return;
      }

      // Валидация пароля
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        setLoading(false);
        return;
      }

      let success = false;
      if (isLogin) {
        success = await login(email, password, boardLink);
        if (!success) {
          setError('НЕВЕРНЫЙ EMAIL ИЛИ ПАРОЛЬ');
        }
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          setError('ВВЕДИТЕ ИМЯ И ФАМИЛИЮ');
          setLoading(false);
          return;
        }
        
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        success = await register(email, password, fullName, boardLink);
        if (!success) {
          setError('ПОЛЬЗОВАТЕЛЬ УЖЕ СУЩЕСТВУЕТ');
        }
      }
    } catch (err) {
      setError('ПРОИЗОШЛА ОШИБКА. ПОПРОБУЙТЕ СНОВА.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'admin' | 'user') => {
    setLoading(true);
    const demoEmail = role === 'admin' ? 'admin@kanban.com' : 'user@kanban.com';
    await login(demoEmail, 'password');
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/image2%20(1).png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Полупрозрачный оверлей */}
      <div className="absolute inset-0 bg-white bg-opacity-30"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KanbanPro</h1>
          <p className="text-gray-600">Управляйте проектами со стилем</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                isLogin
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: isLogin ? '#cfd7ff' : '#CFE8FF' }}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                !isLogin
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: !isLogin ? '#cfd7ff' : '#CFE8FF' }}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Введите имя"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Введите фамилию"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Введите email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Введите пароль"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка на доску (необязательно)
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={boardLink}
                  onChange={(e) => setBoardLink(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Вставьте ссылку на доску"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#cfd7ff' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? (
                    <LogIn className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                  <span>{isLogin ? 'Войти' : 'Создать аккаунт'}</span>
                </>
              )}
            </button>
          </form>

          <div className="px-8 pb-8">
            <div className="text-center text-sm text-gray-500 mb-4">
              Или попробуйте демо аккаунты
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => demoLogin('admin')}
                disabled={loading}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Демо Админ
              </button>
              <button
                onClick={() => demoLogin('user')}
                disabled={loading}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Демо Пользователь
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}