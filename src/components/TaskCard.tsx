import React from 'react';
import {
  Calendar,
  Pin,
  MessageCircle,
  Paperclip,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  User,
} from 'lucide-react';
import { Task, User as UserType } from '../types';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { useApp } from '../context/AppContext';

interface TaskCardProps {
  task: Task;
  users: UserType[];
  onClick: () => void;
  className?: string;
}

export function TaskCard({ task, users, onClick, className = '' }: TaskCardProps) {
  const { deleteTask, toggleTaskPin, currentUser } = useApp();
  const assignee = users.find(user => user.id === task.assigneeId);
  
  const isOverdue = task.deadline && isBefore(new Date(task.deadline), startOfDay(new Date()));
  const isDueSoon = task.deadline && isAfter(new Date(task.deadline), new Date()) && 
    isBefore(new Date(task.deadline), new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

  const priorityColors = {
    high: 'bg-[#FFE1E7] border-[#FFE1E7]',
    medium: 'bg-[#FCFCE9] border-[#FCFCE9]',
    low: 'bg-[#DFFAD7] border-[#DFFAD7]',
  };

  const priorityLabels = {
    high: 'ВЫСОКИЙ',
    medium: 'СРЕДНИЙ',
    low: 'НИЗКИЙ',
  };

  const priorityTextColors = {
    high: 'text-red-700',
    medium: 'text-yellow-700',
    low: 'text-green-700',
  };

  const statusIcons = {
    created: Clock,
    'in-progress': AlertCircle,
    completed: CheckCircle2,
  };

  const StatusIcon = statusIcons[task.status];

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskPin(task.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user can delete this task
    if (currentUser?.role !== 'admin' && task.creatorId !== currentUser?.id) {
      alert('ВЫ МОЖЕТЕ УДАЛЯТЬ ТОЛЬКО СОЗДАННЫЕ ВАМИ ЗАДАЧИ');
      return;
    }
    
    if (window.confirm('ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ЭТУ ЗАДАЧУ?')) {
      deleteTask(task.id);
    }
  };

  // Get the latest comment for display
  const latestComment = task.comments.length > 0 ? task.comments[task.comments.length - 1] : null;
  const commentAuthor = latestComment ? users.find(user => user.id === latestComment.userId) : null;

  // Format description text for display
  const formatDescription = (text: string) => {
    if (!text) return '';
    
    // Simple text formatting - remove markdown/HTML and truncate
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/^\s*[•\-\*]\s*/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s*/gm, '') // Remove numbered lists
      .trim();
    
    return formatted.length > 100 ? formatted.substring(0, 100) + '...' : formatted;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border-2 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-[#CFE8FF] group ${priorityColors[task.priority]} ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-4 h-4 ${
            task.status === 'completed' ? 'text-green-600' :
            task.status === 'in-progress' ? 'text-blue-600' : 'text-gray-500'
          }`} />
          <button
            onClick={handlePinClick}
            className={`p-1 rounded hover:bg-white/50 transition-colors ${
              task.isPinned ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]} ${priorityTextColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>
          <button
            onClick={handleDeleteClick}
            className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title and Description */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 uppercase text-sm">{task.title}</h3>
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {formatDescription(task.description)}
        </p>
      )}

      {/* Latest Comment Preview */}
      {latestComment && commentAuthor && (
        <div className="bg-gray-100 rounded-lg p-2 mb-3 border border-gray-200">
          <div className="flex items-center space-x-2 mb-1">
            <User className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 uppercase">{commentAuthor.name}:</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {latestComment.content.length > 50 
              ? latestComment.content.substring(0, 50) + '...' 
              : latestComment.content}
          </p>
        </div>
      )}

      {/* Deadline */}
      {task.deadline && (
        <div className={`flex items-center space-x-1 mb-3 text-xs ${
          isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
        }`}>
          <Calendar className="w-4 h-4" />
          <span className="uppercase">СРОК {format(new Date(task.deadline), 'dd.MM.yyyy')}</span>
          {isOverdue && <span className="text-red-600 font-medium uppercase">(ПРОСРОЧЕНО)</span>}
          {isDueSoon && <span className="text-orange-600 font-medium uppercase">(СКОРО СРОК)</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Attachments and Comments */}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            {task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            {task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Assignee */}
        {assignee && (
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {assignee.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 hidden sm:inline uppercase">
              {assignee.name.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}