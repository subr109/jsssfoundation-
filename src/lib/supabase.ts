import { createClient } from '@supabase/supabase-js';

// Supabase project configuration provided for JSSS Foundation portal
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://qqzfaxrqzjhvowfctwpp.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZoQYUofSqRZshhczkS2a2g_nOXFdoAe';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseSyncStatus {
  isConnected: boolean;
  projectRef: string;
  lastChecked: string;
  errorMessage?: string;
}

export async function checkSupabaseConnection(): Promise<SupabaseSyncStatus> {
  try {
    const { error } = await supabase.from('audit_logs').select('count', { count: 'exact', head: true });
    // Even if table doesn't exist yet, reaching Supabase returns HTTP 200/404 without network crash
    return {
      isConnected: !error || error.code === 'PGRST116' || error.message.includes('relation') || error.code === '42P01',
      projectRef: 'qqzfaxrqzjhvowfctwpp',
      lastChecked: new Date().toLocaleTimeString(),
      errorMessage: error && error.code !== '42P01' ? error.message : undefined,
    };
  } catch (err: any) {
    return {
      isConnected: false,
      projectRef: 'qqzfaxrqzjhvowfctwpp',
      lastChecked: new Date().toLocaleTimeString(),
      errorMessage: err?.message || 'Connection pending',
    };
  }
}
