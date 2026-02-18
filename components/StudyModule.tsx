
import React, { useState, useEffect, useMemo } from 'react';
import { StudySubject, AppState, StudySession, QuestionLog } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface StudyModuleProps {
  subjects: StudySubject[];
  sessions: StudySession[];
  questionLogs: QuestionLog[];
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const StudyModule: React.FC<StudyModuleProps> = ({ subjects, sessions, questionLogs, updateState }) => {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const [viewingSubjectId, setViewingSubjectId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');

  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  
  // Question Form State
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qCount, setQCount] = useState<number | string>('');

  // Analytics Filter State
  const [analyticsMetric, setAnalyticsMetric] = useState<'hours' | 'questions'>('hours');
  const [filterSubjectId, setFilterSubjectId] = useState('all');
  
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const activeSubject = useMemo(() => subjects.find(s => s.id === activeSubjectId), [subjects, activeSubjectId]);
  const activeTopics = useMemo(() => activeSubject?.topics || [], [activeSubject]);

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const subj: StudySubject = {
      id: 'subj-' + Math.random().toString(36).substr(2, 9),
      name: newSubjectName.trim(),
      topics: [],
      totalHours: 0
    };
    updateState(prev => ({ ...prev, studySubjects: [...prev.studySubjects, subj] }));
    setNewSubjectName('');
    setIsAddingSubject(false);
  };

  const deleteSubject = (id: string) => {
    updateState(prev => ({
      ...prev,
      studySubjects: prev.studySubjects.filter(s => s.id !== id),
      studySessions: (prev.studySessions || []).filter(sess => sess.subjectId !== id),
      questionLogs: (prev.questionLogs || []).filter(q => q.subjectId !== id)
    }));
  };

  const addTopic = (subjectId: string) => {
    if (!newTopicName.trim()) return;
    updateState(prev => ({
      ...prev,
      studySubjects: prev.studySubjects.map(s => 
        s.id === subjectId 
          ? { ...s, topics: [...s.topics, { id: 'top-' + Math.random().toString(36).substr(2, 9), name: newTopicName.trim(), progress: 0 }] } 
          : s
      )
    }));
    setNewTopicName('');
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    updateState(prev => ({
      ...prev,
      studySubjects: prev.studySubjects.map(s => 
        s.id === subjectId 
          ? { ...s, topics: s.topics.filter(t => t.id !== topicId) } 
          : s
      )
    }));
  };

  const registerQuestions = () => {
    if (!qSubjectId || !qCount) return;
    const subj = subjects.find(s => s.id === qSubjectId);
    if (!subj) return;
    const topic = subj.topics.find(t => t.id === qTopicId);
    
    const log: QuestionLog = {
      id: 'qlog-' + Math.random().toString(36).substr(2, 9),
      subjectId: qSubjectId,
      subjectName: subj.name,
      topicName: topic ? topic.name : 'Geral',
      count: Number(qCount),
      date: Date.now()
    };

    updateState(prev => ({
      ...prev,
      questionLogs: [log, ...(prev.questionLogs || [])]
    }));

    setQCount('');
    setShowSaveFeedback(true);
    setTimeout(() => setShowSaveFeedback(false), 2000);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sc = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
  };

  const stopTimer = () => {
    if (!activeSubjectId || seconds === 0) {
      setTimerActive(false);
      setSeconds(0);
      return;
    }

    const selectedSubject = subjects.find(s => s.id === activeSubjectId);
    if (!selectedSubject) return;

    const topic = selectedSubject.topics.find(t => t.id === activeTopicId);
    const topicName = topic ? topic.name : 'Geral';

    const hoursToAdd = seconds / 3600;
    const durationMinutes = Math.max(1, Math.round(seconds / 60));

    const newSession: StudySession = {
      id: 'sess-' + Math.random().toString(36).substr(2, 9),
      subjectId: activeSubjectId,
      subjectName: selectedSubject.name,
      topicName: topicName,
      durationMinutes: durationMinutes,
      date: Date.now()
    };

    updateState(prev => ({
      ...prev,
      studySubjects: prev.studySubjects.map(s => 
        s.id === activeSubjectId 
          ? { ...s, totalHours: Number((s.totalHours + hoursToAdd).toFixed(2)) } 
          : s
      ),
      studySessions: [newSession, ...(prev.studySessions || [])]
    }));

    setTimerActive(false);
    setSeconds(0);
    setShowSaveFeedback(true);
    setTimeout(() => setShowSaveFeedback(false), 3000);
  };

  const deleteLog = (id: string, type: 'session' | 'question') => {
    updateState(prev => ({
      ...prev,
      studySessions: type === 'session' ? prev.studySessions.filter(s => s.id !== id) : prev.studySessions,
      questionLogs: type === 'question' ? prev.questionLogs.filter(q => q.id !== id) : prev.questionLogs
    }));
  };

  // --- ANALYTICS DATA ---
  const filteredData = useMemo(() => {
    if (filterSubjectId === 'all') {
      // Agrupado por Matéria
      return subjects.map(s => {
        let value = 0;
        if (analyticsMetric === 'hours') {
          value = Number(s.totalHours.toFixed(1));
        } else {
          value = questionLogs
            .filter(q => q.subjectId === s.id)
            .reduce((acc, curr) => acc + curr.count, 0);
        }
        return { name: s.name, value };
      }).filter(d => d.value > 0);
    } else {
      // Agrupado por Tópico de uma Matéria específica
      const subj = subjects.find(s => s.id === filterSubjectId);
      if (!subj) return [];
      
      const topicsData = subj.topics.map(t => {
        let value = 0;
        if (analyticsMetric === 'hours') {
          value = sessions
            .filter(sess => sess.subjectId === filterSubjectId && sess.topicName === t.name)
            .reduce((acc, curr) => acc + (curr.durationMinutes / 60), 0);
        } else {
          value = questionLogs
            .filter(q => q.subjectId === filterSubjectId && q.topicName === t.name)
            .reduce((acc, curr) => acc + curr.count, 0);
        }
        return { name: t.name, value: Number(value.toFixed(1)) };
      });

      // Adiciona o "Geral" para sessões sem tópico específico
      let generalValue = 0;
      if (analyticsMetric === 'hours') {
        generalValue = sessions
          .filter(sess => sess.subjectId === filterSubjectId && sess.topicName === 'Geral')
          .reduce((acc, curr) => acc + (curr.durationMinutes / 60), 0);
      } else {
        generalValue = questionLogs
          .filter(q => q.subjectId === filterSubjectId && q.topicName === 'Geral')
          .reduce((acc, curr) => acc + curr.count, 0);
      }
      
      if (generalValue > 0) {
        topicsData.push({ name: 'Geral', value: Number(generalValue.toFixed(1)) });
      }

      return topicsData.filter(d => d.value > 0);
    }
  }, [subjects, sessions, questionLogs, analyticsMetric, filterSubjectId]);

  const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Estudos</h2>
          <p className="text-slate-500 font-medium">Controle seu progresso e conquiste seus objetivos.</p>
        </div>
        <button 
          onClick={() => setIsAddingSubject(true)}
          className="bg-primary-500 text-white px-8 py-4 rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
        >
          + Adicionar Matéria
        </button>
      </header>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        <div className="lg:col-span-1 bg-slate-950 rounded-[48px] p-8 text-white flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl">⏱️</div>
          <div className="relative z-10 w-full max-w-md space-y-6">
            <h3 className="text-primary-400 font-black uppercase tracking-[0.3em] text-[10px]">Timer de Foco</h3>
            <p className="text-6xl md:text-7xl font-black font-mono tracking-tighter tabular-nums drop-shadow-2xl">
              {formatTime(seconds)}
            </p>
            <div className="space-y-3">
              <select 
                disabled={timerActive}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white outline-none"
                value={activeSubjectId || ''}
                onChange={(e) => {
                  setActiveSubjectId(e.target.value);
                  setActiveTopicId(null);
                }}
              >
                <option value="">Matéria</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {activeSubjectId && activeTopics.length > 0 && (
                <select 
                  disabled={timerActive}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white outline-none animate-in fade-in slide-in-from-top-1"
                  value={activeTopicId || ''}
                  onChange={(e) => setActiveTopicId(e.target.value)}
                >
                  <option value="">Assunto</option>
                  {activeTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>
            <button 
              onClick={timerActive ? stopTimer : () => setTimerActive(true)}
              disabled={!activeSubjectId && !timerActive}
              className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${timerActive ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary-500 hover:bg-primary-600 disabled:opacity-20'}`}
            >
              {timerActive ? 'Finalizar Foco' : 'Iniciar Foco'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[48px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Relatório de Performance</h3>
            <div className="flex flex-wrap gap-2">
              <select 
                className="bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none"
                value={analyticsMetric}
                onChange={(e) => setAnalyticsMetric(e.target.value as any)}
              >
                <option value="hours">Horas Estudadas</option>
                <option value="questions">Questões Feitas</option>
              </select>
              <select 
                className="bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none"
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
              >
                <option value="all">Todas as Matérias</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          
          {filteredData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center opacity-20">
              <span className="text-5xl mb-4">📊</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Aguardando registros...</p>
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter ml-2">Matérias Ativas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.length === 0 ? (
              <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 text-center opacity-40">
                <p className="text-xs font-black uppercase tracking-widest">Adicione sua primeira matéria</p>
              </div>
            ) : (
              subjects.map(subject => (
                <div key={subject.id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight truncate pr-2">{subject.name}</h3>
                      <p className="text-[10px] text-primary-500 font-black uppercase mt-1 tracking-widest">{subject.totalHours}H Estudadas</p>
                    </div>
                    <button onClick={() => deleteSubject(subject.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2">🗑️</button>
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>{subject.topics.length} Assuntos</span>
                      <span>Questões: {questionLogs.filter(q => q.subjectId === subject.id).reduce((a, b) => a + b.count, 0)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${Math.min(100, subject.totalHours * 5)}%` }} />
                    </div>
                  </div>
                  <button onClick={() => setViewingSubjectId(subject.id)} className="mt-auto w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-slate-400 dark:text-slate-500 hover:text-primary-500 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all border border-transparent hover:border-primary-100">Gerenciar Assuntos →</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Question Registration Form */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Registrar Questões</h3>
            <div className="space-y-3">
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl text-[10px] font-bold uppercase dark:text-white outline-none"
                value={qSubjectId}
                onChange={(e) => {
                  setQSubjectId(e.target.value);
                  setQTopicId('');
                }}
              >
                <option value="">Matéria</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl text-[10px] font-bold uppercase dark:text-white outline-none disabled:opacity-30"
                value={qTopicId}
                disabled={!qSubjectId}
                onChange={(e) => setQTopicId(e.target.value)}
              >
                <option value="">Assunto (Opcional)</option>
                {subjects.find(s => s.id === qSubjectId)?.topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input 
                type="number" 
                placeholder="Qtd de Questões" 
                className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl text-[10px] font-bold uppercase dark:text-white outline-none"
                value={qCount}
                onChange={(e) => setQCount(e.target.value)}
              />
            </div>
            <button 
              onClick={registerQuestions}
              disabled={!qSubjectId || !qCount}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-20"
            >
              Registrar
            </button>
            {showSaveFeedback && <p className="text-center text-emerald-500 font-black text-[9px] uppercase tracking-widest animate-bounce">Salvo com sucesso!</p>}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter ml-2">Log de Atividades</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {sessions.length === 0 && questionLogs.length === 0 ? (
                <div className="p-12 text-center opacity-20 border border-dashed border-slate-200 rounded-[40px]">
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhum registro</p>
                </div>
              ) : (
                <>
                  {[...sessions, ...questionLogs]
                    .sort((a, b) => b.date - a.date)
                    .map(item => {
                      const isSession = 'durationMinutes' in item;
                      return (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[9px] shrink-0 ${isSession ? 'bg-primary-50 text-primary-500' : 'bg-emerald-50 text-emerald-500'}`}>
                              {isSession ? `${(item as StudySession).durationMinutes}m` : `${(item as QuestionLog).count}Q`}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-black text-slate-800 dark:text-white uppercase truncate">{item.subjectName}</p>
                              <p className="text-[8px] text-slate-400 font-bold truncate">{item.topicName} • {new Date(item.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <button onClick={() => deleteLog(item.id, isSession ? 'session' : 'question')} className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">🗑️</button>
                        </div>
                      );
                    })
                  }
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals are the same but simplified for brevity in this snippet if needed */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-[48px] p-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 text-center">Nova Matéria</h3>
            <input 
              type="text" 
              placeholder="Ex: Informática" 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none mb-8 dark:text-white font-black text-xs text-center focus:ring-2 focus:ring-primary-500/20"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              autoFocus
            />
            <div className="flex flex-col gap-3">
              <button onClick={addSubject} className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Adicionar</button>
              <button onClick={() => setIsAddingSubject(false)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {viewingSubjectId && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[56px] shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-10 pb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Assuntos</h3>
                <button onClick={() => setViewingSubjectId(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-8">
                {subjects.find(s => s.id === viewingSubjectId)?.name}
              </p>
              <div className="flex gap-2 mb-8">
                <input 
                  type="text" 
                  placeholder="Novo assunto..." 
                  className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white font-bold text-xs focus:ring-2 focus:ring-primary-500/20"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTopic(viewingSubjectId)}
                />
                <button onClick={() => addTopic(viewingSubjectId)} className="bg-primary-500 text-white px-5 rounded-2xl font-black text-xl active:scale-90 transition-all">+</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar space-y-3">
              {(subjects.find(s => s.id === viewingSubjectId)?.topics || []).length === 0 ? (
                <div className="py-10 text-center opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem assuntos cadastrados</p>
                </div>
              ) : (
                (subjects.find(s => s.id === viewingSubjectId)?.topics || []).map(topic => (
                  <div key={topic.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl flex items-center justify-between border border-transparent hover:border-slate-100">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{topic.name}</span>
                    <button onClick={() => deleteTopic(viewingSubjectId, topic.id)} className="text-slate-300 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                ))
              )}
            </div>
            <div className="p-10 pt-0">
               <button onClick={() => setViewingSubjectId(null)} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] rounded-3xl transition-all active:scale-95">Concluir</button>
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

export default StudyModule;
