import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

/**
 * Strict validator for Supabase Cloud production credentials.
 * Ensures dummy, template, and unresolvable URLs are rejected.
 */
export function isValidSupabaseConfig(url?: string, key?: string): boolean {
  if (!url || !key) return false;
  const cleanUrl = url.trim().toLowerCase();
  const cleanKey = key.trim();

  // Explicitly reject known placeholders and templates
  if (
    cleanUrl.includes('abcdefgh') ||
    cleanUrl.includes('your-project') ||
    cleanUrl.includes('<') ||
    cleanUrl.includes('>') ||
    cleanUrl.includes('example.com') ||
    cleanUrl.includes('placeholder')
  ) {
    return false;
  }

  // Must match valid https://<project-ref>.supabase.co format
  const supabaseUrlRegex = /^https:\/\/[a-z0-9_-]{10,}\.supabase\.co$/i;
  if (!supabaseUrlRegex.test(cleanUrl)) {
    return false;
  }

  // Key must be an actual non-dummy token of valid length
  if (
    cleanKey.includes('your-') ||
    cleanKey.includes('<') ||
    cleanKey.includes('>') ||
    cleanKey.includes('placeholder') ||
    cleanKey.length < 20
  ) {
    return false;
  }

  return true;
}

export const isSupabaseConfigured = isValidSupabaseConfig(rawUrl, rawKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawKey)
  : null;
