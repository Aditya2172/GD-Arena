import { describe, it, expect } from 'vitest';

/**
 * Mirror of client/src/services/supabase.ts validation logic
 * to guarantee strictness in server test runner.
 */
function isValidSupabaseConfig(url?: string, key?: string): boolean {
  if (!url || !key) return false;
  const cleanUrl = url.trim().toLowerCase();
  const cleanKey = key.trim();

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

  const supabaseUrlRegex = /^https:\/\/[a-z0-9_-]{10,}\.supabase\.co$/i;
  if (!supabaseUrlRegex.test(cleanUrl)) {
    return false;
  }

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

describe('Supabase Client Configuration Validator', () => {
  it('should reject known dummy and placeholder URLs', () => {
    expect(isValidSupabaseConfig('https://abcdefgh.supabase.co', 'sb_publishable_kOjX3PMIBTeA3i8IdsrExQ_lnNS6LX7')).toBe(false);
    expect(isValidSupabaseConfig('https://your-project-id.supabase.co', 'eyJh...validkey...')).toBe(false);
    expect(isValidSupabaseConfig('https://<your-project-id>.supabase.co', 'eyJh...validkey...')).toBe(false);
    expect(isValidSupabaseConfig('https://example.com', 'eyJh...validkey...')).toBe(false);
  });

  it('should reject invalid or short keys', () => {
    expect(isValidSupabaseConfig('https://abcdefghijklmn.supabase.co', 'short-key')).toBe(false);
    expect(isValidSupabaseConfig('https://abcdefghijklmn.supabase.co', '<your-anon-key>')).toBe(false);
    expect(isValidSupabaseConfig('https://abcdefghijklmn.supabase.co', 'placeholder-key-value')).toBe(false);
  });

  it('should accept genuine Supabase Cloud credentials', () => {
    const validUrl = 'https://zxfkpywrmabczxfkpywr.supabase.co';
    const validAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmtweXdybWFiY3p4ZmtweXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.signature';
    expect(isValidSupabaseConfig(validUrl, validAnonKey)).toBe(true);
  });

  it('should treat missing or empty credentials as unconfigured (activating demo mode)', () => {
    expect(isValidSupabaseConfig('', '')).toBe(false);
    expect(isValidSupabaseConfig(undefined, undefined)).toBe(false);
  });
});
