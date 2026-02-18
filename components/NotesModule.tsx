
import React, { useState, useMemo, useRef } from 'react';
import { Note, AppState, NoteLink } from '../types';

interface NotesModuleProps {
  notes: Note[];
  categories: string[];
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const NotesModule: React.FC<NotesModuleProps> = ({ notes, categories, updateState }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tudo');
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formNote, setFormNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    category: categories[0] || 'Geral',
    imageUrl: '',
    links: [],
  });

  const [currentLinkLabel, setCurrentLinkLabel] = useState('');
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');

  const filteredNotes = useMemo(() => {
    const safeNotes = notes || [];
    return safeNotes
      .filter(n => {
        const title = n.title || '';
        const content = n.content || '';
        const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || content.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'Tudo' || n.category === categoryFilter;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [notes, search, categoryFilter]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormNote(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addLinkToForm = () => {
    if (currentLinkLabel.trim() && currentLinkUrl.trim()) {
      let url = currentLinkUrl.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      const newLinks = [...(formNote.links || []), { label: currentLinkLabel.trim(), url }];
      setFormNote(prev => ({ ...prev, links: newLinks }));
      setCurrentLinkLabel('');
      setCurrentLinkUrl('');
    }
  };

  const removeLinkFromForm = (index: number) => {
    setFormNote(prev => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index)
    }));
  };

  const saveNote = () => {
    if (!formNote.title?.trim()) {
      alert("Sua nota precisa de um título.");
      return;
    }

    const noteData: Note = {
      id: editingId || (Math.random().toString(36).substr(2, 9) + Date.now().toString(36)),
      title: formNote.title.trim(),
      content: formNote.content || '',
      category: formNote.category || categories[0] || 'Geral',
      isPinned: editingId ? (notes.find(n => n.id === editingId)?.isPinned || false) : false,
      createdAt: editingId ? (notes.find(n => n.id === editingId)?.createdAt || Date.now()) : Date.now(),
      imageUrl: formNote.imageUrl,
      links: formNote.links || [],
    };

    updateState(prev => ({
      ...prev,
      notes: editingId 
        ? (prev.notes || []).map(n => n.id === editingId ? noteData : n)
        : [noteData, ...(prev.notes || [])]
    }));

    closeForm();
    if (viewingNote && viewingNote.id === editingId) {
      setViewingNote(noteData);
    }
  };

  const openEdit = (note: Note) => {
    setEditingId(note.id);
    setFormNote({
      title: note.title,
      content: note.content,
      category: note.category,
      imageUrl: note.imageUrl,
      links: note.links || [],
    });
    setIsAdding(true);
    setViewingNote(null);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormNote({ title: '', content: '', category: categories[0] || 'Geral', imageUrl: '', links: [] });
    setCurrentLinkLabel('');
    setCurrentLinkUrl('');
  };

  const deleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setNoteToDeleteId(id);
  };

  const confirmDeleteAction = () => {
    if (noteToDeleteId) {
      updateState(prev => ({
        ...prev,
        notes: (prev.notes || []).filter(n => n.id !== noteToDeleteId)
      }));
      setNoteToDeleteId(null);
      setViewingNote(null);
    }
  };

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateState(prev => ({
      ...prev,
      notes: (prev.notes || []).map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n)
    }));
  };

  const addNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      updateState(prev => ({
        ...prev,
        noteCategories: [...prev.noteCategories, trimmed]
      }));
      setNewCategoryName('');
    }
  };

  const deleteCategory = (cat: string) => {
    if (categories.length <= 1) {
      alert("Você deve ter pelo menos um tópico ativo.");
      return;
    }
    
    // Deleta o tópico imediatamente sem window.confirm para agilidade
    updateState(prev => ({
      ...prev,
      noteCategories: prev.noteCategories.filter(c => c !== cat)
    }));

    // Se o filtro ativo for o tópico deletado, reseta para 'Tudo'
    if (categoryFilter === cat) {
      setCategoryFilter('Tudo');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Suas Notas</h2>
          <p className="text-sm text-slate-500 font-medium">Suas ideias organizadas em um só lugar.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
        >
          + Nova Nota
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center px-2">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide items-center">
          <button
            onClick={() => setCategoryFilter('Tudo')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              categoryFilter === 'Tudo' ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
            }`}
          >
            Tudo
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                categoryFilter === cat ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
          <button 
            onClick={() => setIsManagingCategories(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all shadow-sm shrink-0 flex items-center justify-center"
            title="Gerenciar Tópicos"
          >
            <span className="text-lg">⚙️</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center">
             <span className="text-6xl mb-4">📭</span>
             <p className="font-bold">Nenhuma nota encontrada.</p>
          </div>
        ) : filteredNotes.map(note => (
          <div 
            key={note.id} 
            onClick={() => setViewingNote(note)}
            className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group relative hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden cursor-pointer h-full"
          >
            {note.imageUrl && (
              <div className="w-full h-36 overflow-hidden">
                <img src={note.imageUrl} alt={note.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-[9px] font-black uppercase tracking-widest">{note.category}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={(e) => togglePin(e, note.id)} className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? 'text-amber-500' : 'text-slate-300'}`}>📌</button>
                  <button type="button" onClick={(e) => deleteNote(note.id, e)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-tight">{note.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">{note.content}</p>
              {note.links && note.links.length > 0 && <span className="text-[9px] text-primary-500 font-black uppercase tracking-tighter">🔗 {note.links.length} Link(s)</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Adicionar / Editar */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-[40px] p-6 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{editingId ? '✏️ Editar Nota' : '✨ Nova Nota'}</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 p-2 font-bold text-2xl transition-transform hover:scale-110">✕</button>
            </div>
            
            <div className="space-y-4">
              <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video max-h-36 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-slate-100">
                {formNote.imageUrl ? <img src={formNote.imageUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400 font-black uppercase">Adicionar Imagem</span>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              <div className="grid grid-cols-1 gap-3">
                <input type="text" placeholder="Título da nota" className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary-500/30" value={formNote.title} onChange={(e) => setFormNote({...formNote, title: e.target.value})} />
                <select className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold dark:text-white outline-none cursor-pointer" value={formNote.category} onChange={(e) => setFormNote({...formNote, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="p-5 bg-primary-50/50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-900/20">
                <label className="text-[8px] font-black text-primary-600 dark:text-primary-400 uppercase block mb-3">Links e Referências</label>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      placeholder="Nome do link" 
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-[10px] dark:text-white outline-none border border-transparent focus:border-primary-200 shadow-sm" 
                      value={currentLinkLabel} 
                      onChange={(e) => setCurrentLinkLabel(e.target.value)} 
                    />
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="URL" 
                        className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-[10px] dark:text-white outline-none border border-transparent focus:border-primary-200 shadow-sm" 
                        value={currentLinkUrl} 
                        onChange={(e) => setCurrentLinkUrl(e.target.value)} 
                      />
                      <button 
                        type="button" 
                        onClick={addLinkToForm} 
                        className="bg-primary-500 text-white px-5 rounded-xl font-black text-xl shadow-md transition-all active:scale-90 flex items-center justify-center min-w-[48px]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {formNote.links?.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border text-[8px] font-bold shadow-sm">
                        <span className="truncate max-w-[80px] text-slate-700 dark:text-slate-300">{link.label}</span>
                        <button type="button" onClick={() => removeLinkFromForm(idx)} className="text-red-500 hover:scale-125 transition-transform p-0.5">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <textarea placeholder="Escreva o conteúdo da sua nota aqui..." rows={3} className="w-full px-5 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 text-xs dark:text-white resize-none outline-none focus:ring-2 focus:ring-primary-500/30" value={formNote.content} onChange={(e) => setFormNote({...formNote, content: e.target.value})} />
            </div>

            <div className="flex gap-4 mt-8">
              <button type="button" onClick={closeForm} className="flex-1 py-3.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
              <button type="button" onClick={saveNote} className="flex-[2] py-4 bg-primary-500 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95">Salvar Nota</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gerenciar Categorias (EXCLUSÃO INSTANTÂNEA) */}
      {isManagingCategories && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[340px] rounded-[40px] p-8 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Gerenciar Tópicos</h3>
                <button onClick={() => setIsManagingCategories(false)} className="text-slate-400 hover:text-slate-600 p-2 text-xl">✕</button>
             </div>

             <div className="space-y-2 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 animate-in fade-in zoom-in-95">
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{cat}</span>
                    <button 
                      onClick={() => deleteCategory(cat)} 
                      className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 text-red-400 hover:text-red-600 hover:shadow-sm rounded-xl transition-all border border-slate-100 dark:border-slate-700 active:scale-90"
                      title="Excluir Tópico"
                    >
                      <span className="text-base">🗑️</span>
                    </button>
                  </div>
                ))}
             </div>

             <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Adicionar novo tópico</label>
                <div className="flex gap-2">
                   <input 
                      type="text" 
                      placeholder="Ex: Viagens" 
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] font-bold dark:text-white outline-none border border-transparent focus:border-primary-200"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                   />
                   <button 
                      onClick={addNewCategory}
                      className="bg-primary-500 text-white px-5 rounded-xl font-black text-xl shadow-md active:scale-90 transition-all flex items-center justify-center"
                   >
                    +
                   </button>
                </div>
             </div>

             <button 
                onClick={() => setIsManagingCategories(false)}
                className="w-full mt-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
             >
                Concluído
             </button>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {viewingNote && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-[48px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/5 my-auto">
            
            {viewingNote.imageUrl && (
              <div className="w-full h-32 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-black/40">
                <img src={viewingNote.imageUrl} className="w-full h-full object-cover" alt={viewingNote.title} />
              </div>
            )}

            <div className="absolute top-4 right-4 flex gap-2">
              <button type="button" onClick={() => openEdit(viewingNote)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-800 shadow-lg text-[10px] hover:scale-110 transition-transform">✏️</button>
              <button type="button" onClick={() => deleteNote(viewingNote.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-800 shadow-lg text-[10px] text-red-500 hover:scale-110 transition-transform">🗑️</button>
              <button type="button" onClick={() => setViewingNote(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-800 shadow-lg text-[10px] hover:scale-110 transition-transform">✕</button>
            </div>
            
            <div className="p-10 md:p-12">
              <div className="mb-4">
                <span className="px-3 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full text-[8px] font-black uppercase tracking-widest inline-block border border-primary-100 dark:border-primary-900/30">
                  {viewingNote.category}
                </span>
              </div>
              
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-4 leading-tight tracking-tight">
                {viewingNote.title}
              </h3>

              <div className="max-h-36 overflow-y-auto pr-2 mb-8 custom-scrollbar">
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed whitespace-pre-wrap font-medium">
                  {viewingNote.content}
                </p>
              </div>

              {viewingNote.links && viewingNote.links.length > 0 && (
                <div className="space-y-2 mt-6">
                  <h4 className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Links Salvos</h4>
                  <div className="flex flex-col gap-2">
                    {viewingNote.links.map((link, idx) => (
                      <a 
                        key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-primary-500 hover:text-white transition-all group border border-slate-100/50 dark:border-slate-800/50"
                      >
                        <span className="text-sm group-hover:scale-110 transition-transform">🔗</span>
                        <span className="text-[9px] font-bold truncate max-w-[180px]">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 flex items-center justify-between text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] pt-5 border-t border-slate-50 dark:border-slate-800/20">
                <span className="text-primary-500/50 tracking-[0.6em]">SUAS NOTAS</span>
                <span>{new Date(viewingNote.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de NOTA */}
      {noteToDeleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-[40px] p-10 shadow-2xl border border-white/10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🗑️</div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Tem certeza?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Esta ação não pode ser desfeita e a nota será removida para sempre.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteAction}
                className="w-full py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                Confirmar Exclusão
              </button>
              <button 
                onClick={() => setNoteToDeleteId(null)}
                className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default NotesModule;
