
import React, { useRef } from 'react';
import { AppState } from '../types';

interface SettingsModuleProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ state, updateState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    updateState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState(prev => ({
          ...prev,
          user: { ...prev.user, avatarUrl: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    updateState(prev => ({ ...prev, isLoggedIn: false }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <header className="text-center">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer"
        >
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-5xl">
            {state.user.avatarUrl ? (
              <img src={state.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              "👤"
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-black uppercase tracking-widest">Alterar</span>
          </div>
          <div className="absolute bottom-0 right-0 bg-primary-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
             📸
          </div>
        </div>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleAvatarUpload} 
        />
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white uppercase tracking-tighter">Configurações</h2>
        <p className="text-slate-500 font-medium">Personalize seu espaço de evolução.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Card */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6 dark:text-white uppercase tracking-tight">Perfil e Metas</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Seu Nome</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white font-bold focus:ring-2 focus:ring-primary-500/20"
                value={state.user.name}
                onChange={(e) => updateState(prev => ({ ...prev, user: { ...prev.user, name: e.target.value } }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meta de Água (ml)</label>
              <input 
                type="number" 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white font-bold focus:ring-2 focus:ring-primary-500/20"
                value={state.user.waterGoal}
                onChange={(e) => updateState(prev => ({ ...prev, user: { ...prev.user, waterGoal: parseInt(e.target.value) || 0 } }))}
              />
            </div>
          </div>
        </section>

        {/* Interface Card */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6 dark:text-white uppercase tracking-tight">Interface</h3>
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-[24px]">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{state.theme === 'light' ? '☀️' : '🌙'}</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest">Modo {state.theme === 'light' ? 'Claro' : 'Escuro'}</span>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${state.theme === 'dark' ? 'bg-primary-500' : 'bg-slate-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${state.theme === 'dark' ? 'translate-x-6' : ''} shadow-sm`} />
            </button>
          </div>
        </section>

        {/* Logout Section */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <button 
            onClick={handleLogout}
            className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <span>🚪</span>
            Sair da Conta
          </button>
        </section>

        <footer className="text-center py-10 opacity-30 text-[9px] font-black uppercase tracking-[5px] dark:text-white">
          MY LIFE IS HERE v1.2.0
        </footer>
      </div>
    </div>
  );
};

export default SettingsModule;
