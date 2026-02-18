
import React, { useState, useMemo } from 'react';
import { Meal, AppState } from '../types';

interface MealModuleProps {
  meals: Meal[];
  manualItems: string[];
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MealModule: React.FC<MealModuleProps> = ({ meals, manualItems, updateState }) => {
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copiar Lista');
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const updateMeal = (day: number, field: keyof Meal, value: string) => {
    updateState(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.day === day ? { ...m, [field]: value } : m)
    }));
  };

  const addManualItem = () => {
    const trimmed = newItemName.trim();
    if (trimmed) {
      updateState(prev => ({
        ...prev,
        manualShoppingItems: [...(prev.manualShoppingItems || []), trimmed]
      }));
      setNewItemName('');
    }
  };

  const removeManualItem = (index: number) => {
    updateState(prev => ({
      ...prev,
      manualShoppingItems: (prev.manualShoppingItems || []).filter((_, i) => i !== index)
    }));
  };

  const shoppingList = useMemo(() => {
    const counts: Record<string, number> = {};
    
    meals.forEach(m => {
      [m.breakfast, m.lunch, m.snack, m.dinner].forEach(text => {
        text.split(/[,;.\n]/).forEach(rawItem => {
          const item = rawItem.trim().toLowerCase();
          if (item.length > 2) {
            const formatted = item.charAt(0).toUpperCase() + item.slice(1);
            counts[formatted] = (counts[formatted] || 0) + 1;
          }
        });
      });
    });

    manualItems.forEach(rawItem => {
      const item = rawItem.trim();
      if (item.length > 0) {
        counts[item] = (counts[item] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [meals, manualItems]);

  const copyToClipboard = () => {
    if (shoppingList.length === 0) return;
    
    const text = `🛒 MINHA LISTA DE COMPRAS\n\n` + 
      shoppingList.map(i => `• ${i.name} (${i.count}x)`).join('\n') + 
      `\n\nGerado por MY LIFE IS HERE ✨`;

    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('Copiado! ✅');
      setTimeout(() => setCopyStatus('Copiar Lista'), 2000);
    });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Planejamento Alimentar</h2>
          <p className="text-slate-500 font-medium">Organize sua dieta para ter energia o dia todo.</p>
        </div>
        <button 
          onClick={() => setIsShoppingListOpen(true)}
          className="bg-primary-500 px-6 py-4 rounded-[24px] shadow-xl shadow-primary-500/20 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-600 transition-all flex items-center gap-3 active:scale-95"
        >
          <span className="text-xl">🛒</span>
          Lista de Compras
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {meals.map(meal => (
          <div key={meal.day} className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 text-center border-b border-slate-50 dark:border-slate-800">
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-[10px]">{weekDays[meal.day]}</span>
            </div>
            <div className="p-8 space-y-6">
              <MealItem label="Café da Manhã" icon="☕" value={meal.breakfast} onChange={(val) => updateMeal(meal.day, 'breakfast', val)} />
              <MealItem label="Almoço" icon="🍲" value={meal.lunch} onChange={(val) => updateMeal(meal.day, 'lunch', val)} />
              <MealItem label="Lanche" icon="🍎" value={meal.snack} onChange={(val) => updateMeal(meal.day, 'snack', val)} />
              <MealItem label="Jantar" icon="🥗" value={meal.dinner} onChange={(val) => updateMeal(meal.day, 'dinner', val)} />
            </div>
            <div className="mt-auto p-5 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-50 dark:border-slate-800/50">
               <textarea 
                  placeholder="Observações..." 
                  className="w-full bg-transparent border-none text-[11px] font-medium focus:ring-0 text-slate-400 dark:text-slate-500 resize-none h-14 italic"
                  value={meal.notes}
                  onChange={(e) => updateMeal(meal.day, 'notes', e.target.value)}
               />
            </div>
          </div>
        ))}
      </div>

      {isShoppingListOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[48px] shadow-2xl border border-white/5 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Mercado</h3>
                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-1">Lista consolidada</p>
              </div>
              <button onClick={() => setIsShoppingListOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 shadow-sm font-bold">✕</button>
            </div>

            <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Adicionar item extra (ex: Detergente)"
                  className="flex-1 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl text-[11px] font-bold dark:text-white border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addManualItem()}
                />
                <button onClick={addManualItem} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 rounded-2xl font-black text-xl active:scale-90 transition-all">+</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-3">
              {shoppingList.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <span className="text-6xl block mb-4">🛒</span>
                  <p className="font-black uppercase text-xs tracking-widest leading-relaxed">Sua lista está vazia.<br/>Planeje suas refeições!</p>
                </div>
              ) : (
                shoppingList.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl group border border-transparent hover:border-primary-100">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary-500 bg-white dark:bg-slate-800">
                        <span className="text-[9px] font-black">{item.count}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item.name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const idx = manualItems.indexOf(item.name);
                        if (idx > -1) removeManualItem(idx);
                      }}
                      className={`text-slate-300 hover:text-red-500 transition-colors ${manualItems.includes(item.name) ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={copyToClipboard}
                disabled={shoppingList.length === 0}
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] rounded-[24px] shadow-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {copyStatus}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

const MealItem: React.FC<{ label: string; icon: string; value: string; onChange: (v: string) => void }> = ({ label, icon, value, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-base group-hover:scale-125 transition-transform duration-500">{icon}</span>
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</label>
    </div>
    <input 
      type="text" 
      placeholder="Planejar..." 
      className="w-full text-xs font-bold bg-transparent border-b-2 border-slate-50 dark:border-slate-800 focus:border-primary-400 focus:outline-none transition-all dark:text-white pb-1 placeholder:text-slate-200 dark:placeholder:text-slate-800"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default MealModule;
