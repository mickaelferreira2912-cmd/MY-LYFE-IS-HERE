
import React, { useState, useEffect } from 'react';
import { TabType, AppState } from './types';
import { supabase } from './services/supabase';
import Sidebar from './components/Navigation';
import Dashboard from './components/Dashboard';
import NotesModule from './components/NotesModule';
import WaterModule from './components/WaterModule';
import RoutineModule from './components/RoutineModule';
import WeeklyModule from './components/WeeklyModule';
import MealModule from './components/MealModule';
import StudyModule from './components/StudyModule';
import MusicModule from './components/MusicModule';
import SettingsModule from './components/SettingsModule';
import Login from './components/Login';

const STORAGE_KEY = 'zenith_app_state_v1';

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

  // Monitora mudanças na sessão de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setState(INITIAL_STATE);
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

      if (data) {
        setState({ ...data.data, isLoggedIn: true });
      } else {
        // Se for novo usuário, criamos o perfil dele
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userId, data: INITIAL_STATE }]);
        
        if (insertError) console.error("Erro ao criar perfil:", insertError);
        setState({ ...INITIAL_STATE, isLoggedIn: true });
      }
    } catch (err) {
      console.error("Erro ao buscar dados do Supabase:", err);
      // Fallback para localStorage se o banco falhar
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    }
  };

  const saveToSupabase = async (updatedState: AppState) => {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Tema
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Sincronização remota automática (Debounced idealmente, mas direto para simplificar)
    if (state.isLoggedIn) {
      const timeoutId = setTimeout(() => saveToSupabase(state), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard state={state} updateState={updateState} setActiveTab={setActiveTab} />;
      case 'notes': return <NotesModule notes={state.notes} categories={state.noteCategories} updateState={updateState} />;
      case 'water': return <WaterModule waterHistory={state.waterHistory} waterGoal={state.user.waterGoal} reminders={state.waterReminders} updateState={updateState} />;
      case 'daily': return <RoutineModule tasks={state.tasks} updateState={updateState} />;
      case 'weekly': return <WeeklyModule tasks={state.tasks} updateState={updateState} />;
      case 'meals': return <MealModule meals={state.meals} manualItems={state.manualShoppingItems} updateState={updateState} />;
      case 'study': return <StudyModule subjects={state.studySubjects} sessions={state.studySessions || []} questionLogs={state.questionLogs || []} updateState={updateState} />;
      case 'music': return <MusicModule sessions={state.musicSessions} instruments={state.musicInstruments} updateState={updateState} />;
      case 'settings': return <SettingsModule state={state} updateState={updateState} />;
      default: return <Dashboard state={state} updateState={updateState} setActiveTab={setActiveTab} />;
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
            <div className="fixed top-4 right-4 z-[300] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-primary-500 border border-primary-500/20 flex items-center gap-2">
              <div className="w-1 h-1 bg-primary-500 rounded-full animate-ping"></div>
              Sincronizando Nuvem
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;