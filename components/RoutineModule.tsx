
import React, { useState } from 'react';
import { Task, AppState } from '../types';

interface RoutineModuleProps {
  tasks: Task[];
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const RoutineModule: React.FC<RoutineModuleProps> = ({ tasks, updateState }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [selectedViewDate, setSelectedViewDate] = useState(todayStr);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskDate, setNewTaskDate] = useState(todayStr);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Filtra tarefas pela data selecionada no topo
  const filteredTasks = tasks.filter(t => t.date === selectedViewDate);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    // Calcula o dia da semana (0-6) com base na data escolhida
    const dateObj = new Date(newTaskDate + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
      title: newTaskTitle.trim(),
      time: newTaskTime,
      date: newTaskDate,
      priority: newTaskPriority,
      completed: false,
      day: dayOfWeek
    };
    
    updateState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setNewTaskTitle('');
    // Mantém a data no formulário para facilitar inserções múltiplas no mesmo dia
  };

  const toggleTask = (id: string) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (id: string) => {
    updateState(prev => ({ 
      ...prev, 
      tasks: prev.tasks.filter(t => t.id !== id) 
    }));
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800';
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Rotina Diária</h2>
          <div className="flex items-center gap-3">
             <input 
                type="date" 
                className="bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-1 text-xs font-bold text-primary-500 shadow-sm outline-none cursor-pointer"
                value={selectedViewDate}
                onChange={(e) => setSelectedViewDate(e.target.value)}
             />
             <p className="text-slate-500 font-medium text-sm">{formatDisplayDate(selectedViewDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-2 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="text-center px-6 py-2 border-r border-slate-50 dark:border-slate-800">
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Restantes</p>
             <p className="text-xl font-black text-slate-700 dark:text-white">{filteredTasks.filter(t => !t.completed).length}</p>
           </div>
           <div className="text-center px-6 py-2">
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Concluídas</p>
             <p className="text-xl font-black text-primary-500">{filteredTasks.filter(t => t.completed).length}</p>
           </div>
        </div>
      </header>

      {/* Formulário de Adição de Tarefa com campo DATA */}
      <form onSubmit={addTask} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-5 mx-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Objetivo</label>
            <input 
              type="text" 
              placeholder="O que vamos conquistar hoje?" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold dark:text-white focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-300"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data</label>
            <input 
              type="date" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold dark:text-white focus:ring-4 focus:ring-primary-500/10"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Horário</label>
            <input 
              type="time" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold dark:text-white focus:ring-4 focus:ring-primary-500/10"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prioridade</label>
            <select 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold dark:text-white focus:ring-4 focus:ring-primary-500/10 cursor-pointer"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
            >
              <option value="low">Prioridade Baixa</option>
              <option value="medium">Prioridade Média</option>
              <option value="high">Prioridade Alta</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-primary-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95 mt-2">
          Adicionar Tarefa
        </button>
      </form>

      {/* Lista de Tarefas */}
      <div className="space-y-4 px-2">
        {filteredTasks.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-6 opacity-30">
            <div className="text-7xl">✨</div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Nada agendado para este dia.</p>
          </div>
        ) : (
          filteredTasks
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(task => (
              <div 
                key={task.id} 
                className={`group flex items-center justify-between p-6 rounded-[32px] transition-all duration-300 border animate-in zoom-in-95 ${
                  task.completed 
                    ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 opacity-50' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary-100'
                }`}
              >
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-90 ${
                      task.completed 
                        ? 'bg-primary-500 border-primary-500 text-white' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {task.completed ? '✓' : ''}
                  </button>
                  <div>
                    <h3 className={`font-black text-lg transition-all tracking-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="text-sm">🕒</span> {task.time}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="text-sm">📅</span> {task.date.split('-').reverse().join('/')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Crítico' : task.priority === 'medium' ? 'Importante' : 'Rotina'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-75 group-hover:text-slate-400"
                  title="Excluir Tarefa"
                >
                  <span className="text-xl">🗑️</span>
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default RoutineModule;
