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

// Prometheus / OpenMetrics Compatible Endpoint
app.get('/api/metrics', (req, res) => {
  const mem = process.memoryUsage();
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send([
    '# HELP nodejs_uptime_seconds Process uptime in seconds',
    '# TYPE nodejs_uptime_seconds gauge',
    `nodejs_uptime_seconds ${process.uptime().toFixed(2)}`,
    '# HELP nodejs_heap_used_bytes Process heap memory used in bytes',
    '# TYPE nodejs_heap_used_bytes gauge',
    `nodejs_heap_used_bytes ${mem.heapUsed}`,
    '# HELP nodejs_heap_total_bytes Process heap memory total in bytes',
    '# TYPE nodejs_heap_total_bytes gauge',
    `nodejs_heap_total_bytes ${mem.heapTotal}`,
    '# HELP nodejs_rss_bytes Process resident set size in bytes',
    '# TYPE nodejs_rss_bytes gauge',
    `nodejs_rss_bytes ${mem.rss}`,
    '# HELP gdarena_service_up GD Arena backend operational status (1 = up)',
    '# TYPE gdarena_service_up gauge',
    'gdarena_service_up 1'
  ].join('\n') + '\n');
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
