import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { AuthUser } from '../types/index.js';

// Extend Express Request to hold authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

let supabaseClient: any = null;
if (config.isSupabaseConfigured) {
  supabaseClient = createClient(
    config.supabaseUrl, 
    config.supabaseServiceRoleKey || config.supabaseAnonKey
  );
}

export const authenticateUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check for authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development / demo mode, allow fallback demo user if requested
      if (req.headers['x-demo-user-id']) {
        const demoId = String(req.headers['x-demo-user-id']);
        req.user = {
          id: demoId,
          email: `${demoId}@demo.gdarena.app`,
          displayName: 'Demo Candidate'
        };
        return next();
      }

      res.status(401).json({ 
        error: 'Authentication required. Missing or invalid Bearer token.' 
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Special handling for local demo tokens
    if (token.startsWith('demo-')) {
      req.user = {
        id: token,
        email: `${token}@demo.gdarena.app`,
        displayName: 'Demo Student'
      };
      return next();
    }

    // Verify token with Supabase if configured
    if (supabaseClient) {
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      
      if (error || !user) {
        res.status(401).json({ error: 'Invalid or expired authentication session.' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Candidate'
      };
      return next();
    }

    // Fallback if Supabase is not configured: verify basic token string
    req.user = {
      id: token,
      email: 'user@gdarena.app',
      displayName: 'Candidate'
    };
    return next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication verification failed.' });
  }
};
