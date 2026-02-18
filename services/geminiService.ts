
import { GoogleGenAI } from "@google/genai";

// Fixed: Initializing strictly according to guidelines using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FALLBACK_QUOTES = [
  "Hoje, você pode ser melhor do que foi ontem.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "A disciplina é a ponte entre metas e realizações.",
  "Não pare quando estiver cansado, pare quando tiver terminado.",
  "A consistência supera o talento quando o talento não tem consistência.",
  "Seu futuro é criado pelo que você faz hoje, não amanhã.",
  "O foco determina a sua realidade.",
  "Trabalhe duro em silêncio, deixe seu sucesso ser o seu barulho."
];

const QUOTE_CACHE_KEY = 'zenith_cached_quote';
const QUOTE_DATE_KEY = 'zenith_quote_date';

export async function getMotivationalQuote(userName: string): Promise<string> {
  const today = new Date().toDateString();
  const cachedDate = localStorage.getItem(QUOTE_DATE_KEY);
  const cachedQuote = localStorage.getItem(QUOTE_CACHE_KEY);

  // Se já temos uma frase para hoje, não chama a API
  if (cachedDate === today && cachedQuote) {
    return cachedQuote;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase motivacional curta e impactante (máximo 15 palavras) em português para o usuário ${userName}. O foco deve ser produtividade, disciplina e foco. Use obrigatoriamente um tom similar a: "Hoje, você pode ser melhor do que foi ontem."`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 60,
      }
    });

    const quote = response.text?.replace(/"/g, '') || FALLBACK_QUOTES[0];
    
    // Salva no cache
    localStorage.setItem(QUOTE_CACHE_KEY, quote);
    localStorage.setItem(QUOTE_DATE_KEY, today);
    
    return quote;
  } catch (error) {
    console.warn("Gemini API Quota reached or error. Using primary user fallback quote.");
    const primaryFallback = FALLBACK_QUOTES[0]; 
    
    localStorage.setItem(QUOTE_CACHE_KEY, primaryFallback);
    localStorage.setItem(QUOTE_DATE_KEY, today);
    
    return primaryFallback;
  }
}

export async function getStudyAdvice(subject: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dê uma dica rápida de estudo em português para a matéria: ${subject}. Seja conciso.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });
    return response.text || "A consistência é a chave para o aprendizado.";
  } catch (error) {
    return "Divida o conteúdo em pequenos blocos e faça revisões constantes.";
  }
}
