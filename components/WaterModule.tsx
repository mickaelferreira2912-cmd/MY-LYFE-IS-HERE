
import React, { useMemo, useRef } from 'react';
import { AppState, Reminder } from '../types';

interface WaterModuleProps {
  waterHistory: { date: string; amount: number }[];
  waterGoal: number;
  reminders: Reminder[];
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const WaterModule: React.FC<WaterModuleProps> = ({ waterHistory, waterGoal, reminders, updateState }) => {
  const today = new Date().toISOString().split('T')[0];
  const audioContextRef = useRef<AudioContext | null>(null);

  // --- CÁLCULOS DINÂMICOS ---
  
  const todayAmount = useMemo(() => {
    return waterHistory?.find(h => h.date === today)?.amount || 0;
  }, [waterHistory, today]);

  const progress = Math.min((todayAmount / (waterGoal || 2000)) * 100, 100);

  const stats = useMemo(() => {
    // Volume Total Acumulado (Todos os tempos)
    const totalVolumeMl = waterHistory?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const totalVolumeLiters = (totalVolumeMl / 1000).toFixed(1);

    if (!waterHistory || waterHistory.length === 0) {
      return { average: "0.0", streak: 0, totalAccumulated: "0.0" };
    }

    // Média dos registros existentes
    const sum = waterHistory.reduce((acc, curr) => acc + curr.amount, 0);
    const avg = (sum / waterHistory.length) / 1000;

    // Cálculo do Streak (dias consecutivos batendo a meta)
    let streak = 0;
    const sortedHistory = [...waterHistory].sort((a, b) => b.date.localeCompare(a.date));
    
    for (const record of sortedHistory) {
      if (record.amount >= waterGoal) {
        streak++;
      } else if (record.date === today) {
        continue;
      } else {
        break;
      }
    }

    return { average: avg.toFixed(1), streak, totalAccumulated: totalVolumeLiters };
  }, [waterHistory, waterGoal, today]);

  // --- ÁUDIO E INTERAÇÃO ---

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playWaterSound = () => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playGoalReachedSound = () => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playNote(523.25, now, 0.3); // C5
    playNote(659.25, now + 0.15, 0.3); // E5
    playNote(783.99, now + 0.3, 0.5); // G5
  };

  const addWater = (ml: number) => {
    const oldAmount = todayAmount;
    const newAmount = oldAmount + ml;
    
    playWaterSound();

    if (newAmount >= waterGoal && oldAmount < waterGoal) {
      setTimeout(() => playGoalReachedSound(), 200);
    }

    updateState(prev => {
      const history = [...(prev.waterHistory || [])];
      const index = history.findIndex(h => h.date === today);
      if (index > -1) {
        history[index] = { ...history[index], amount: newAmount };
      } else {
        history.push({ date: today, amount: ml });
      }
      return { ...prev, waterHistory: history };
    });
  };

  const resetToday = () => {
    updateState(prev => ({
      ...prev,
      waterHistory: (prev.waterHistory || []).map(h => h.date === today ? { ...h, amount: 0 } : h)
    }));
  };

  const toggleReminder = (id: string) => {
    updateState(prev => ({
      ...prev,
      waterReminders: prev.waterReminders.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    }));
  };

  const size = 280;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Controle de Água</h2>
        <p className="text-slate-500">Mantenha seu corpo hidratado para uma mente brilhante.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center relative overflow-hidden min-h-[550px] justify-center">
          
          <div 
            className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out bg-blue-500/10 pointer-events-none"
            style={{ height: `${progress}%` }}
          >
            <div className="absolute top-0 left-0 w-[200%] h-16 -translate-y-full animate-wave overflow-hidden">
               <svg className="w-full h-full fill-blue-500/10" viewBox="0 0 1000 100" preserveAspectRatio="none">
                 <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" />
               </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-10 text-slate-800 dark:text-white z-10">Seu progresso hoje</h3>
          
          <div className="relative flex items-center justify-center z-10" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="absolute transform -rotate-90">
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                style={{
                  strokeDashoffset: isNaN(offset) ? circumference : offset,
                  transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                strokeLinecap="round"
                className="text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]"
              />
            </svg>

            <div className="flex flex-col items-center justify-center text-center select-none">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-1">Total</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-6xl font-black transition-all duration-300 ${todayAmount >= waterGoal ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                  {todayAmount}
                </span>
                <span className="text-sm font-bold text-slate-400">ml</span>
              </div>
              <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 my-3 rounded-full" />
              <span className="text-sm font-medium text-slate-400 italic">meta {waterGoal}ml</span>
              {todayAmount >= waterGoal && (
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full animate-bounce shadow-lg">Meta Atingida! 🎉</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full mt-12 z-10">
            <button onClick={() => addWater(250)} className="group bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 py-5 rounded-[24px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/20 active:scale-90 transition-all flex flex-col items-center gap-2 border border-blue-100 dark:border-blue-900/20">
              <span className="text-2xl group-hover:bounce">🥛</span>
              <span className="text-[10px] uppercase tracking-wider">250ml</span>
            </button>
            <button onClick={() => addWater(500)} className="group bg-blue-100 dark:bg-blue-800/20 text-blue-700 dark:text-blue-400 py-5 rounded-[24px] font-bold hover:bg-blue-200 dark:hover:bg-blue-800/30 active:scale-90 transition-all flex flex-col items-center gap-2 border border-blue-200 dark:border-blue-800/20">
              <span className="text-2xl group-hover:bounce">💧</span>
              <span className="text-[10px] uppercase tracking-wider">500ml</span>
            </button>
            <button onClick={() => addWater(1000)} className="group bg-primary-500 text-white py-5 rounded-[24px] font-bold hover:bg-primary-600 active:scale-90 transition-all shadow-xl shadow-primary-500/20 flex flex-col items-center gap-2">
              <span className="text-2xl group-hover:bounce">🏺</span>
              <span className="text-[10px] uppercase tracking-wider">1 Litro</span>
            </button>
          </div>

          <button onClick={resetToday} className="mt-12 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors z-10">Zerar hoje</button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-black p-8 rounded-[40px] text-white shadow-2xl flex flex-col justify-between border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🧠</span>
                <h4 className="text-lg font-bold">Dica de Saúde</h4>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8 text-sm">
                Manter-se hidratado aumenta sua clareza mental e foco. O cérebro é composto por cerca de 75% de água!
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center transition-transform hover:scale-105">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Média Diária</p>
                <p className="text-xl font-black text-blue-400">{stats.average}<span className="text-[10px] ml-1">L</span></p>
              </div>
              <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center transition-transform hover:scale-105">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Streak</p>
                <p className="text-xl font-black text-emerald-400">{stats.streak}<span className="text-[10px] ml-1">dias</span></p>
              </div>
              <div className="p-4 bg-white/10 rounded-3xl border border-blue-500/30 text-center transition-transform hover:scale-105 ring-1 ring-blue-500/20">
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-2">Total Geral</p>
                <p className="text-xl font-black text-white">{stats.totalAccumulated}<span className="text-[10px] ml-1">L</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h4 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
              <span>🔔</span> Lembretes Ativos
            </h4>
            <div className="space-y-3">
              {reminders.map(r => (
                <ReminderRow 
                  key={r.id}
                  time={r.time} 
                  label={r.label} 
                  isActive={r.isActive} 
                  onToggle={() => toggleReminder(r.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: translateX(0) translateY(-100%); }
          100% { transform: translateX(-50%) translateY(-100%); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-wave {
          animation: wave 4s linear infinite;
        }
        .group:hover .group-hover\:bounce {
          animation: bounce 0.6s ease infinite;
        }
      `}</style>
    </div>
  );
};

const ReminderRow: React.FC<{ time: string; label: string; isActive: boolean; onToggle: () => void }> = ({ time, label, isActive, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
    <div className="flex items-center gap-4">
      <span className="text-sm font-black text-primary-500 font-mono bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg">{time}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div 
      onClick={onToggle}
      className={`w-10 h-6 rounded-full p-1 transition-all cursor-pointer ${isActive ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isActive ? 'translate-x-4' : ''}`} />
    </div>
  </div>
);

export default WaterModule;
