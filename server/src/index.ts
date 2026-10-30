import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from './config/env.js';
import { authenticateUser } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sessionRouter } from './routes/sessionRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { analyticsRouter } from './routes/analyticsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cross-Origin Resource Sharing
app.use(cors({
  origin: [
    config.clientUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id']
}));

app.use(express.json({ limit: '1mb' }));

// Global Rate Limiter: 100 requests per minute per IP/user
app.use(rateLimiter(60000, 100));

// Public Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GD Arena Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    port: config.port,
    aiProvider: config.aiProvider,
    isAiConfigured: config.isAiConfigured,
    aiEngineMode: config.isAiConfigured ? 'cloud_llm' : 'adaptive_heuristic_engine',
    database: config.isSupabaseConfigured ? 'supabase_postgresql' : 'in_memory_isolated_mode',
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    features: {
      eightDimensionPlacementRubric: true,
      adaptiveDiscussionEngine: true,
      sharedDiscussionMemory: true,
      speechClarityLab: true,
      antiRepetitionFilter: true
    }
  });
});

// Protected API routes
app.use('/api/sessions', authenticateUser, sessionRouter);
app.use('/api/sessions', authenticateUser, aiRouter);
app.use('/api/analytics', authenticateUser, analyticsRouter);

// Centralized error handling
app.use(errorHandler);

// Serve static frontend assets from client/dist if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start server if not running inside test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 GD Arena Server running on port: ${config.port}`);
    console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`🧠 AI Provider: ${config.aiProvider.toUpperCase()} (Configured: ${config.isAiConfigured})`);
    console.log(`🗄️ Database: ${config.isSupabaseConfigured ? 'Supabase PostgreSQL' : 'High-speed In-Memory (Dev/Demo Mode)'}`);
    console.log(`==================================================\n`);
  });
}

export default app;
