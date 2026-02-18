import { createClient } from '@supabase/supabase-js';

// No Netlify (ambiente de navegador sem build), process.env pode não estar disponível.
// Usamos fallbacks para garantir que o app não quebre durante o deploy inicial.
const SUPABASE_URL = process?.env?.SUPABASE_URL || 'https://padzesxgdaetqyhsewdv.supabase.co';
const SUPABASE_KEY = process?.env?.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_iXe9vQQWg1yHuUXl-t_k7A_YBN1UsJo';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("Atenção: Variáveis de ambiente do Supabase não detectadas. Usando credenciais de demonstração.");
}

// O createClient exige strings válidas para não disparar o erro "supabaseUrl is required"
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_KEY || 'placeholder_key'
);
