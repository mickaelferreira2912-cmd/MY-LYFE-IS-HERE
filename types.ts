
export type TabType = 'home' | 'notes' | 'water' | 'daily' | 'weekly' | 'meals' | 'study' | 'music' | 'settings';

export interface NoteLink {
  label: string;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  createdAt: number;
  imageUrl?: string;
  links?: NoteLink[];
  checklist?: { text: string; completed: boolean }[];
}

export interface Task {
  id: string;
  title: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  day: number; // 0-6 para compatibilidade com visão semanal
  date: string; // Formato YYYY-MM-DD
}

export interface Meal {
  id: string;
  day: number; // 0-6
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  notes?: string;
}

export interface StudySubject {
  id: string;
  name: string;
  topics: { id: string; name: string; progress: number }[];
  totalHours: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  topicName: string;
  durationMinutes: number;
  date: number;
}

export interface QuestionLog {
  id: string;
  subjectId: string;
  subjectName: string;
  topicName: string;
  count: number;
  date: number;
}

export interface MusicSession {
  id: string;
  instrument: string;
  duration: number; // minutes
  date: number;
  notes: string;
}

export interface Reminder {
  id: string;
  time: string;
  label: string;
  isActive: boolean;
}

export interface AppState {
  isLoggedIn: boolean;
  user: {
    name: string;
    waterGoal: number; // in ml
    avatarUrl?: string; // Foto do usuário
  };
  waterHistory: { date: string; amount: number }[];
  waterReminders: Reminder[];
  notes: Note[];
  noteCategories: string[];
  tasks: Task[];
  meals: Meal[];
  studySubjects: StudySubject[];
  studySessions: StudySession[];
  questionLogs: QuestionLog[];
  musicSessions: MusicSession[];
  musicInstruments: string[];
  manualShoppingItems: string[]; // Itens extras da lista de compras
  theme: 'light' | 'dark';
}
