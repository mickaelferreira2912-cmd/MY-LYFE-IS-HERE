
import React from 'react';
import { Task, AppState } from '../types';

interface WeeklyModuleProps {
  tasks: Task[];
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const WeeklyModule: React.FC<WeeklyModuleProps> = ({ tasks, updateState }) => {
  const weekDays = [
    { name: 'Segunda', id: 1 },
    { name: 'Terça', id: 2 },
    { name: 'Quarta', id: 3 },
    { name: 'Quinta', id: 4 },
    { name: 'Sexta', id: 5 },
    { name: 'Sábado', id: 6 },
    { name: 'Domingo', id: 0 },
  ];

  const getTasksForDay = (dayId: number) => tasks.filter(t => t.day === dayId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Visão Semanal</h2>
        <p className="text-slate-500">Planeje sua jornada e visualize sua carga semanal.</p>
      </header>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px]">
          {weekDays.map(day => (
            <div key={day.id} className="flex-1 flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-white">{day.name}</span>
                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-bold">
                  {getTasksForDay(day.id).length}
                </span>
              </div>
              
              <div className="flex flex-col gap-3 min-h-[300px] bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl p-3 border-2 border-dashed border-slate-100 dark:border-slate-800">
                {getTasksForDay(day.id).map(task => (
                  <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <span className="text-[10px] font-bold text-slate-400">{task.time}</span>
                    </div>
                    <p className={`text-sm font-semibold leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                  </div>
                ))}
                {getTasksForDay(day.id).length === 0 && (
                  <div className="flex-1 flex items-center justify-center opacity-20 text-4xl">🏝️</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyModule;
