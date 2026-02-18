import { createClient } from '@supabase/supabase-js';

// Prioritizes environment variables set in the hosting provider (Netlify)
// Fallback to the provided keys for immediate functionality
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://padzesxgdaetqyhsewdv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_iXe9vQQWg1yHuUXl-t_k7A_YBN1UsJo';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are set in environment variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
