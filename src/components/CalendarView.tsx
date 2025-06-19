import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { TaskModal } from './TaskModal';
import { Task } from '../types';

export function CalendarView() {
  const { users, getCurrentBoardTasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tasks = getCurrentBoardTasks();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      return isSameDay(new Date(task.deadline), date);
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const priorityColors = {
    high: '#FFB3BA',
    medium: '#FFDFBA', 
    low: '#BAFFC9',
  };

  // Мобильная версия - список задач
  if (isMobile) {
    const tasksWithDates = tasks
      .filter(task => task.deadline)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" style={{ color: '#CFE8FF' }} />
            <h2 className="text-lg font-bold text-gray-900 uppercase">
              КАЛЕНДАРЬ ЗАДАЧ
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {tasksWithDates.map((task) => {
            const assignee = users.find(user => user.id === task.assigneeId);
            const taskDate = new Date(task.deadline!);
            const dayName = format(taskDate, 'EEEE', { locale: ru });
            
            return (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 uppercase mb-1">
                      {format(taskDate, 'dd MMMM yyyy', { locale: ru }).toUpperCase()} - {dayName.toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-gray-900 uppercase text-sm mb-1">
                      {task.title}
                    </h3>
                    {assignee && (
                      <div className="text-xs text-gray-600 uppercase">
                        {assignee.name}
                      </div>
                    )}
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: priorityColors[task.priority] }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          {tasksWithDates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm uppercase">НЕТ ЗАДАЧ С УСТАНОВЛЕННЫМИ СРОКАМИ</p>
            </div>
          )}
        </div>

        <TaskModal
          task={selectedTask || undefined}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </div>
    );
  }

  // Десктопная версия - календарная сетка
  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Заголовок календаря */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="w-6 h-6" style={{ color: '#CFE8FF' }} />
          <h2 className="text-2xl font-bold text-gray-900 uppercase">
            {format(currentDate, 'LLLL yyyy', { locale: ru }).toUpperCase()}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-lg transition-colors font-medium uppercase"
            style={{ color: '#CFE8FF' }}
          >
            СЕГОДНЯ
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Календарная сетка */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Заголовки дней недели */}
        <div className="grid grid-cols-7" style={{ backgroundColor: '#cfd7ff' }}>
          {['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Дни календаря */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-32 p-2 border-b border-r border-gray-200 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isDayToday 
                    ? 'text-white w-6 h-6 rounded-full flex items-center justify-center'
                    : isCurrentMonth 
                    ? 'text-gray-900' 
                    : 'text-gray-400'
                }`}
                style={isDayToday ? { backgroundColor: '#CFE8FF' } : {}}
                >
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => {
                    const assignee = users.find(user => user.id === task.assigneeId);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-all"
                        style={{ 
                          backgroundColor: priorityColors[task.priority],
                          borderColor: priorityColors[task.priority]
                        }}
                      >
                        <div className="font-medium truncate uppercase">{task.title}</div>
                        {assignee && (
                          <div className="text-xs opacity-75 truncate uppercase">
                            {assignee.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center uppercase">
                      +{dayTasks.length - 3} ЕЩЕ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Легенда */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: priorityColors.high }}></div>
          <span className="text-gray-600 uppercase">ВЫСОКИЙ ПРИОРИТЕТ</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: priorityColors.medium }}></div>
          <span className="text-gray-600 uppercase">СРЕДНИЙ ПРИОРИТЕТ</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: priorityColors.low }}></div>
          <span className="text-gray-600 uppercase">НИЗКИЙ ПРИОРИТЕТ</span>
        </div>
      </div>

      <TaskModal
        task={selectedTask || undefined}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}