import { createClient } from '@supabase/supabase-js';

// No navegador sem build, process.env.X é lido do polyfill definido no index.html
const SUPABASE_URL = window.process?.env?.SUPABASE_URL || 'https://padzesxgdaetqyhsewdv.supabase.co';
const SUPABASE_KEY = window.process?.env?.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_iXe9vQQWg1yHuUXl-t_k7A_YBN1UsJo';

// O client é exportado já configurado. Se as chaves mudarem no index.html, ele refletirá aqui.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
