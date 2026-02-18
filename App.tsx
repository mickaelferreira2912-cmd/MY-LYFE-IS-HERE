import React, { useState, useEffect } from 'react';
import { TabType, AppState } from './types.ts';
import { supabase } from './services/supabase.ts';
import Sidebar from './components/Navigation.tsx';
import Dashboard from './components/Dashboard.tsx';
import NotesModule from './components/NotesModule.tsx';
import WaterModule from './components/WaterModule.tsx';
import RoutineModule from './components/RoutineModule.tsx';
import WeeklyModule from './components/WeeklyModule.tsx';
import MealModule from './components/MealModule.tsx';
import StudyModule from './components/StudyModule.tsx';
import MusicModule from './components/MusicModule.tsx';
import SettingsModule from './components/SettingsModule.tsx';
import Login from './components/Login.tsx';

const STORAGE_KEY = 'zenith_app_state_v2';

const INITIAL_STATE: AppState = {
  isLoggedIn: false,
  user: {
    name: 'Explorador',
    waterGoal: 2000,
    avatarUrl: undefined,
  },
  waterHistory: [],
  waterReminders: [
    { id: '1', time: '08:00', label: 'Despertar Hidratado', isActive: true },
    { id: '2', time: '11:30', label: 'Antes do Almoço', isActive: true },
    { id: '3', time: '15:00', label: 'Pausa do Trabalho', isActive: false },
    { id: '4', time: '19:00', label: 'Meta Final', isActive: true },
  ],
  notes: [],
  noteCategories: ['Pessoal', 'Estudos', 'Ideias', 'Trabalho'],
  tasks: [],
  meals: Array.from({ length: 7 }, (_, i) => ({
    id: `meal-${i}`,
    day: i,
    breakfast: '',
    lunch: '',
    snack: '',
    dinner: '',
    notes: ''
  })),
  studySubjects: [],
  studySessions: [],
  questionLogs: [],
  musicSessions: [],
  musicInstruments: ['Violão', 'Teclado', 'Bateria', 'Voz', 'Guitarra', 'Piano', 'Baixo'],
  manualShoppingItems: [],
  theme: 'light',
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Monitora mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setState(prev => ({ ...INITIAL_STATE, theme: prev.theme }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.data) {
        // MERGE SEGURO: Garante que novas propriedades do INITIAL_STATE existam
        // Mesmo que o usuário tenha dados antigos salvos no banco
        setState({
          ...INITIAL_STATE,
          ...data.data,
          user: { ...INITIAL_STATE.user, ...data.data.user },
          isLoggedIn: true 
        });
      } else {
        // Novo usuário
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userId, data: INITIAL_STATE }]);
        
        if (insertError) console.error("Erro ao criar perfil:", insertError);
        setState({ ...INITIAL_STATE, isLoggedIn: true });
      }
    } catch (err) {
      console.error("Erro ao buscar dados do Supabase:", err);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({ ...INITIAL_STATE, ...parsed, isLoggedIn: true });
      }
    }
  };

  const saveToSupabase = async (updatedState: AppState) => {
    if (!updatedState.isLoggedIn) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      setIsSyncing(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          data: updatedState, 
          updated_at: new Date().toISOString() 
        });
      
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao salvar no Supabase:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (state.isLoggedIn) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (state.isLoggedIn) {
      const timeoutId = setTimeout(() => saveToSupabase(state), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const renderContent = () => {
    // Verificação de segurança adicional para evitar crash se arrays forem undefined
    const safeState = {
      ...INITIAL_STATE,
      ...state
    };

    switch (activeTab) {
      case 'home': return <Dashboard state={safeState} updateState={updateState} setActiveTab={setActiveTab} />;
      case 'notes': return <NotesModule notes={safeState.notes || []} categories={safeState.noteCategories || []} updateState={updateState} />;
      case 'water': return <WaterModule waterHistory={safeState.waterHistory || []} waterGoal={safeState.user.waterGoal} reminders={safeState.waterReminders || []} updateState={updateState} />;
      case 'daily': return <RoutineModule tasks={safeState.tasks || []} updateState={updateState} />;
      case 'weekly': return <WeeklyModule tasks={safeState.tasks || []} updateState={updateState} />;
      case 'meals': return <MealModule meals={safeState.meals || []} manualItems={safeState.manualShoppingItems || []} updateState={updateState} />;
      case 'study': return <StudyModule subjects={safeState.studySubjects || []} sessions={safeState.studySessions || []} questionLogs={safeState.questionLogs || []} updateState={updateState} />;
      case 'music': return <MusicModule sessions={safeState.musicSessions || []} instruments={safeState.musicInstruments || []} updateState={updateState} />;
      case 'settings': return <SettingsModule state={safeState} updateState={updateState} />;
      default: return <Dashboard state={safeState} updateState={updateState} setActiveTab={setActiveTab} />;
    }
  };

  if (!state.isLoggedIn) {
    return <Login updateState={updateState} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen animate-in fade-in duration-1000">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={state.user} />
      <main className="flex-1 overflow-y-auto h-screen pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {isSyncing && (
            <div className="fixed top-4 right-4 z-[300] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-primary-500 border border-primary-500/20 flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
              Nuvem Ativa
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;