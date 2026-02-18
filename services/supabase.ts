import { createClient } from '@supabase/supabase-js';

// Fallbacks seguros para evitar erro de "supabaseUrl is required"
const DEFAULT_URL = 'https://padzesxgdaetqyhsewdv.supabase.co';
const DEFAULT_KEY = 'sb_publishable_iXe9vQQWg1yHuUXl-t_k7A_YBN1UsJo';

const SUPABASE_URL = (window as any).process?.env?.SUPABASE_URL || DEFAULT_URL;
const SUPABASE_KEY = (window as any).process?.env?.SUPABASE_PUBLISHABLE_KEY || DEFAULT_KEY;

// Inicializa o cliente garantindo que strings não vazias sejam passadas
export const supabase = createClient(
  SUPABASE_URL || DEFAULT_URL,
  SUPABASE_KEY || DEFAULT_KEY
);
