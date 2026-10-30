import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory or root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // AI Provider
  aiProvider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  
  get isSupabaseConfigured(): boolean {
    return Boolean(this.supabaseUrl && (this.supabaseServiceRoleKey || this.supabaseAnonKey));
  },
  
  get isAiConfigured(): boolean {
    if (this.aiProvider === 'gemini') return Boolean(this.geminiApiKey);
    if (this.aiProvider === 'openai') return Boolean(this.openaiApiKey);
    if (this.aiProvider === 'groq') return Boolean(this.groqApiKey);
    if (this.aiProvider === 'anthropic') return Boolean(this.anthropicApiKey);
    return false;
  }
};
