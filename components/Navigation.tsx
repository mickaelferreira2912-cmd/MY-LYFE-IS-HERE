import React from 'react';
import { TabType, AppState } from '../types.ts';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: AppState['user'];
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, user }) => {
  const menuItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'Início', icon: '🏠' },
    { id: 'notes', label: 'Notas', icon: '📝' },
    { id: 'water', label: 'Água', icon: '💧' },
    { id: 'daily', label: 'Rotina', icon: '📅' },
    { id: 'weekly', label: 'Semana', icon: '📆' },
    { id: 'meals', label: 'Alimentação', icon: '🥗' },
    { id: 'study', label: 'Estudos', icon: '📚' },
    { id: 'music', label: 'Música', icon: '🎵' },
    { id: 'settings', label: 'Config', icon: '⚙️' },
  ];

  return (
    <>
      <nav className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 sticky top-0 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          {user.avatarUrl ? (
            <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-primary-500 shadow-sm">
              <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-sm font-black tracking-tighter bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent uppercase">MY LIFE IS HERE</h1>
        </div>
        
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[11px] font-bold uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center">Foco e Disciplina</p>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300">
        <div className="flex justify-around items-center h-16 px-2 overflow-x-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[50px] transition-colors duration-200 ${
                activeTab === item.id ? 'text-primary-500' : 'text-slate-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;