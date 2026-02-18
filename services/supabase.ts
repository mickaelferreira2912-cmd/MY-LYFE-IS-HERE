
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://padzesxgdaetqyhsewdv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iXe9vQQWg1yHuUXl-t_k7A_YBN1UsJo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
