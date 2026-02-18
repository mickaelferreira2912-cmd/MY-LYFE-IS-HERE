import { GoogleGenAI } from "@google/genai";

// Acesso via window.process para garantir captura do polyfill no navegador
const apiKey = window.process?.env?.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const FALLBACK_QUOTES = [
  "Hoje, você pode ser melhor do que foi ontem.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "A disciplina é a ponte entre metas e realizações.",
  "A consistência supera o talento quando o talento não tem consistência."
];

const QUOTE_CACHE_KEY = 'zenith_cached_quote';
const QUOTE_DATE_KEY = 'zenith_quote_date';

export async function getMotivationalQuote(userName: string): Promise<string> {
  const today = new Date().toDateString();
  const cachedDate = localStorage.getItem(QUOTE_DATE_KEY);
  const cachedQuote = localStorage.getItem(QUOTE_CACHE_KEY);

  if (cachedDate === today && cachedQuote) return cachedQuote;

  if (!apiKey) return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase motivacional curta em português para ${userName} sobre disciplina.`,
    });

    const quote = response.text?.replace(/"/g, '') || FALLBACK_QUOTES[0];
    localStorage.setItem(QUOTE_CACHE_KEY, quote);
    localStorage.setItem(QUOTE_DATE_KEY, today);
    return quote;
  } catch (error) {
    return FALLBACK_QUOTES[0];
  }
}

export async function getStudyAdvice(subject: string): Promise<string> {
  if (!apiKey) return "A constância é a chave para o aprendizado.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dica rápida de estudo para: ${subject}.`,
    });
    return response.text || "Divida o conteúdo em pequenos blocos.";
  } catch (error) {
    return "Mantenha o foco nos fundamentos.";
  }
}