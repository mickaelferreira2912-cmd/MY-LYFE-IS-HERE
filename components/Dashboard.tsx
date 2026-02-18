
import React, { useEffect, useState, useMemo } from 'react';
import { AppState, TabType } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// Import the motivational quote service which uses Gemini API
import { getMotivationalQuote } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  setActiveTab: (tab: TabType) => void;
}

// Added: Define the missing interface for DashboardCard props
interface DashboardCardProps {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, updateState, setActiveTab }) => {
  // Use state for the motivational quote to allow asynchronous updates from Gemini API
  const [quote, setQuote] = useState("Hoje, você pode ser melhor do que foi ontem.");
  const [displayProgress, setDisplayProgress] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    // Corrected: Filter tasks specifically for today to show relevant dashboard progress
    const todayTasks = state.tasks.filter(t => t.completed && t.date === today).length;
    const totalTodayTasks = state.tasks.filter(t => t.date === today).length;
    const waterToday = state.waterHistory.find(w => w.date === today)?.amount || 0;
    const studyHours = state.studySubjects.reduce((acc, s) => acc + s.totalHours, 0);
    const musicSessionsCount = state.musicSessions.length;

    return {
      taskProgress: totalTodayTasks === 0 ? 0 : Math.round((todayTasks / totalTodayTasks) * 100),
      waterAmount: waterToday,
      studyHours,
      musicSessionsCount
    };
  }, [state.tasks, state.waterHistory, state.studySubjects, state.musicSessions, today]);

  // Effect to fetch a fresh motivational quote from Gemini API on mount or user change
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const fetchedQuote = await getMotivationalQuote(state.user.name);
        setQuote(fetchedQuote);
      } catch (err) {
        console.error("Error fetching quote:", err);
      }
    };
    fetchQuote();
  }, [state.user.name]);

  useEffect(() => {
    const target = stats.taskProgress;
    if (displayProgress < target) {
      const timer = setTimeout(() => setDisplayProgress(prev => prev + 1), 20);
      return () => clearTimeout(timer);
    } else if (displayProgress > target) {
      const timer = setTimeout(() => setDisplayProgress(prev => prev - 1), 20);
      return () => clearTimeout(timer);
    }
  }, [stats.taskProgress, displayProgress]);

  const chartData = state.waterHistory.slice(-7).map(item => ({
    name: new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
    amount: item.amount
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const size = 200;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.taskProgress / 100) * circumference;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          {state.user.avatarUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500 shadow-lg">
              <img src={state.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-white dark:border-slate-800">
              👤
            </div>
          )}
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
              {getGreeting()}, <span className="text-primary-500">{state.user.name}</span>!
            </h2>
            <p className="text-slate-500 font-medium">Seu resumo de performance para hoje.</p>
          </div>
        </div>
      </header>

      {/* Card de Foco Central com frase do Gemini */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 dark:from-white dark:to-slate-100 rounded-[48px] p-10 md:p-14 text-white dark:text-slate-900 shadow-2xl border border-white/5 dark:border-slate-200 group">
        <div className="relative z-10 flex flex-col items-start max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 dark:bg-primary-500/10 border border-primary-500/30 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-400 dark:text-primary-600">Foco do Dia</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-black leading-snug tracking-tight italic">
            "{quote}"
          </h3>
          <div className="mt-8 flex gap-6">
             <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">Resiliência</span>
             <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">Progresso</span>
             <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">Evolução</span>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] group-hover:bg-primary-500/20 transition-all duration-1000"></div>
      </div>

      {/* Grid de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard icon="✅" title="Checklist" value={`${stats.taskProgress}%`} subtitle="Feito hoje" color="bg-emerald-500" onClick={() => setActiveTab('daily')} />
        <DashboardCard icon="💧" title="Água" value={`${stats.waterAmount}ml`} subtitle="Faltam ml" color="bg-blue-500" onClick={() => setActiveTab('water')} />
        <DashboardCard icon="📚" title="Estudos" value={`${stats.studyHours}h`} subtitle="Tempo total" color="bg-purple-500" onClick={() => setActiveTab('study')} />
        <DashboardCard icon="🎵" title="Música" value={stats.musicSessionsCount.toString()} subtitle="Práticas" color="bg-orange-500" onClick={() => setActiveTab('music')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Análise de Hidratação</h3>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Últimos 7 dias</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '10px' }}
                />
                <Bar dataKey="amount" radius={[12, 12, 12, 12]} barSize={28}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount >= state.user.waterGoal ? '#0ea5e9' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-10 relative z-10">Meta Concluída</h3>
          <div className="relative flex items-center justify-center z-10" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="absolute transform -rotate-90">
              <circle cx={center} cy={center} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-50 dark:text-slate-800" />
              {/* Corrected: Replaced missing gradient with primary color */}
              <circle cx={center} cy={center} r={radius} fill="transparent" stroke="#0ea5e9" strokeWidth={strokeWidth} strokeDasharray={circumference} style={{ strokeDashoffset: isNaN(offset) ? circumference : offset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }} strokeLinecap="round" />
            </svg>
            <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-50 duration-500">
              <div className="flex items-baseline">
                <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter tabular-nums">{displayProgress}</span>
                <span className="text-xl font-black text-primary-500 ml-0.5">%</span>
              </div>
              <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em] mt-2">Pronto</span>
            </div>
          </div>
          <p className="mt-12 text-[11px] font-bold text-slate-400 leading-relaxed max-w-[200px] relative z-10">
            {stats.taskProgress === 100 ? "Meta batida! Você foi incrível hoje. 🏆" : "Cada tarefa concluída te aproxima da meta."}
          </p>
        </div>
      </div>
    </div>
  );
};

// Fixed: Component correctly typed with DashboardCardProps
const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, subtitle, color, onClick }) => (
  <button onClick={onClick} className="bg-white dark:bg-slate-900 p-8 rounded-[36px] shadow-sm border border-slate-50 dark:border-slate-800 flex flex-col items-start gap-5 hover:border-primary-200 dark:hover:border-primary-900/40 hover:shadow-xl transition-all duration-300 text-left group overflow-hidden relative">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white ${color} group-hover:scale-110 transition-transform shadow-lg shadow-current/10`}>{icon}</div>
    <div className="relative z-10">
      <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</h4>
      <p className="text-2xl font-black text-slate-800 dark:text-white mt-1 tracking-tight">{value}</p>
      <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase">{subtitle}</p>
    </div>
  </button>
);

export default Dashboard;
