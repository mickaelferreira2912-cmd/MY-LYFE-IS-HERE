
import React, { useState, useMemo } from 'react';
import { MusicSession, AppState } from '../types';

interface MusicModuleProps {
  sessions: MusicSession[];
  instruments: string[];
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MusicModule: React.FC<MusicModuleProps> = ({ sessions, instruments, updateState }) => {
  const [instrument, setInstrument] = useState(instruments[0] || 'Violão');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [isManagingInstruments, setIsManagingInstruments] = useState(false);
  const [newInstrumentName, setNewInstrumentName] = useState('');

  const totalPracticeTime = useMemo(() => {
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} MIN`;
    return `${hours}H ${mins > 0 ? `${mins}M` : ''}`;
  }, [sessions]);

  const addSession = () => {
    const session: MusicSession = {
      id: crypto.randomUUID(),
      instrument,
      duration,
      date: Date.now(),
      notes
    };
    updateState(prev => ({ ...prev, musicSessions: [session, ...prev.musicSessions] }));
    setNotes('');
  };

  const deleteSession = (id: string) => {
    updateState(prev => ({
      ...prev,
      musicSessions: prev.musicSessions.filter(s => s.id !== id)
    }));
  };

  const addNewInstrument = () => {
    const trimmed = newInstrumentName.trim();
    if (trimmed && !instruments.includes(trimmed)) {
      updateState(prev => ({
        ...prev,
        musicInstruments: [...prev.musicInstruments, trimmed]
      }));
      setNewInstrumentName('');
    }
  };

  const deleteInstrument = (inst: string) => {
    if (instruments.length <= 1) {
      return;
    }
    updateState(prev => ({
      ...prev,
      musicInstruments: prev.musicInstruments.filter(i => i !== inst)
    }));
    if (instrument === inst) setInstrument(instruments.find(i => i !== inst) || '');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header className="px-2">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Música</h2>
        <p className="text-slate-500 font-medium">Sua jornada musical registrada nota por nota.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        {/* Formulario de Nova Prática */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">Nova Prática</h3>
            <button 
              onClick={() => setIsManagingInstruments(true)}
              className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm flex items-center justify-center text-xl"
              title="Gerenciar Instrumentos"
            >
              ⚙️
            </button>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Escolha o Instrumento</label>
              <div className="flex flex-wrap gap-2">
                {instruments.map(inst => (
                  <button
                    key={inst}
                    onClick={() => setInstrument(inst)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                      instrument === inst 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-orange-200'
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração</label>
                <span className="text-xl font-black text-orange-500">{duration} min</span>
              </div>
              <input 
                type="range" min="5" max="180" step="5"
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Anotações do dia</label>
              <textarea 
                className="w-full px-5 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none text-[11px] font-bold dark:text-white focus:ring-2 focus:ring-orange-500/20 h-28 resize-none placeholder:text-slate-300"
                placeholder="Ex: Pratiquei escalas em Sol Maior..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button 
              onClick={addSession}
              className="w-full py-5 bg-orange-500 text-white font-black uppercase text-[10px] tracking-widest rounded-[24px] shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
            >
              Registrar Estudo
            </button>
          </div>
        </div>

        {/* Historico */}
        <div className="lg:col-span-2 space-y-6 pb-24">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Histórico de Prática</h3>
            <div className="bg-orange-50 dark:bg-orange-900/10 px-4 py-2 rounded-2xl border border-orange-100 dark:border-orange-900/20">
              <span className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest">Tempo Total: {totalPracticeTime}</span>
            </div>
          </div>

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-20 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 text-center opacity-30">
                <span className="text-6xl mb-4 block">🎸</span>
                <p className="font-black uppercase text-xs tracking-widest">Nenhuma prática registrada ainda.</p>
              </div>
            ) : (
              sessions.map(session => (
                <div key={session.id} className="group bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-5 animate-in fade-in slide-in-from-bottom-2 hover:border-orange-200 transition-all relative">
                  <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                    {session.instrument.toLowerCase().includes('violão') || session.instrument.toLowerCase().includes('guitarra') ? '🎸' : 
                     session.instrument.toLowerCase().includes('teclado') || session.instrument.toLowerCase().includes('piano') ? '🎹' : 
                     session.instrument.toLowerCase().includes('bateria') ? '🥁' : '🎼'}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight truncate pr-4">{session.instrument}</h4>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      <p className="text-orange-500 font-black text-[9px] uppercase tracking-widest">{session.duration} MINUTOS</p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium leading-relaxed italic">
                      {session.notes ? `"${session.notes}"` : '"Sem anotações"'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => deleteSession(session.id)}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Gerenciar Instrumentos - REDESENHADO PARA SER IMPOSSÍVEL DE CORTAR */}
      {isManagingInstruments && (
        <div 
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-300"
          onClick={() => setIsManagingInstruments(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-[56px] shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()} // Impede fechar ao clicar dentro
          >
             {/* Cabeçalho Fixo */}
             <div className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800 relative">
                <button 
                  onClick={() => setIsManagingInstruments(false)} 
                  className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-110 active:scale-90 transition-all font-bold text-xl shadow-sm z-50"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">Instrumentos</h3>
                <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Sua coleção de práticas</p>
             </div>

             {/* Corpo com Scroll */}
             <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar space-y-3">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lista atual</label>
                  {instruments.map(inst => (
                    <div key={inst} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-orange-100 transition-all group">
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{inst}</span>
                      <button 
                        onClick={() => deleteInstrument(inst)} 
                        className={`w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all ${instruments.length > 1 ? 'opacity-100' : 'opacity-20 cursor-not-allowed'}`}
                        disabled={instruments.length <= 1}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-8 space-y-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Novo instrumento</label>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="Ex: Teclado" 
                        className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[11px] font-bold dark:text-white outline-none border border-transparent focus:border-orange-500 shadow-inner"
                        value={newInstrumentName}
                        onChange={(e) => setNewInstrumentName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addNewInstrument()}
                     />
                     <button 
                        onClick={addNewInstrument}
                        className="bg-orange-500 text-white px-5 rounded-2xl font-black text-2xl shadow-lg shadow-orange-500/20 active:scale-90 transition-all"
                     >
                      +
                     </button>
                  </div>
                </div>
             </div>

             {/* Rodapé Fixo */}
             <div className="p-10 pt-0">
               <button 
                  onClick={() => setIsManagingInstruments(false)}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] rounded-3xl transition-all shadow-xl active:scale-95"
               >
                  Concluir
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

export default MusicModule;
