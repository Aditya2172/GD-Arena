import { Router, Request, Response, NextFunction } from 'express';
import { dbService } from '../services/dbService.js';
import { orchestrationService } from '../services/orchestrationService.js';
import { discussionMemoryService } from '../services/discussionMemoryService.js';
import { createSessionSchema, addMessageSchema } from '../utils/validators.js';

export const sessionRouter = Router();

// POST /api/sessions - Create new session
sessionRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validatedData = createSessionSchema.parse(req.body);

    const session = await dbService.createSession({
      user_id: userId,
      topic: validatedData.topic,
      difficulty: validatedData.difficulty,
      duration_minutes: validatedData.duration_minutes,
      participant_count: validatedData.participant_count,
      discussion_style: validatedData.discussion_style,
      language: validatedData.language,
      selected_personalities: validatedData.selected_personalities,
      status: 'in_progress',
      started_at: new Date().toISOString()
    });

    // Automatically generate opening turn from one of the AI participants
    const starter = await orchestrationService.generateDiscussionStarter(session);
    
    // Save opening message to DB
    const firstMessage = await dbService.addMessage({
      session_id: session.id,
      speaker_type: 'ai',
      speaker_name: starter.speaker.name,
      personality: starter.speaker.id,
      message_text: starter.text,
      sequence_number: 1
    });

    res.status(201).json({
      session,
      initialMessage: firstMessage,
      participants: orchestrationService.getSessionPersonalities(session.selected_personalities)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions - List user sessions
sessionRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessions = await dbService.getUserSessions(userId);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/compare - Compare two completed discussion sessions
sessionRouter.post('/compare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { sessionAId, sessionBId } = req.body;
    if (!sessionAId || !sessionBId) {
      res.status(400).json({ error: 'Both sessionAId and sessionBId are required.' });
      return;
    }
    const comparison = await dbService.compareSessions(String(sessionAId), String(sessionBId), userId);
    res.json({ comparison });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/exercises/complete - Record completed improvement drill
sessionRouter.post('/exercises/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { exerciseId } = req.body;
    if (!exerciseId) {
      res.status(400).json({ error: 'exerciseId is required.' });
      return;
    }
    const result = await dbService.completeExercise(String(exerciseId), userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/exercises/completed - Get list of completed drill IDs
sessionRouter.get('/exercises/completed', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const completed = await dbService.getCompletedExercises(userId);
    res.json({ completed });
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:id/memory - Get structured discussion memory
sessionRouter.get('/:id/memory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessionId = String(req.params.id);

    const session = await dbService.getSessionById(sessionId, userId);
    if (!session) {
      res.status(404).json({ error: 'Session not found or access denied.' });
      return;
    }

    const messages = await dbService.getSessionMessages(sessionId);
    const memory = discussionMemoryService.updateMemory(session, messages);
    res.json({ memory });
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:id - Get session details + messages
sessionRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessionId = String(req.params.id);

    const session = await dbService.getSessionById(sessionId, userId);
    if (!session) {
      res.status(404).json({ error: 'Session not found or access denied.' });
      return;
    }

    const messages = await dbService.getSessionMessages(sessionId);
    const participants = orchestrationService.getSessionPersonalities(session.selected_personalities);

    res.json({
      session,
      messages,
      participants
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:id/messages - Store a validated discussion message
sessionRouter.post('/:id/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessionId = String(req.params.id);

    const session = await dbService.getSessionById(sessionId, userId);
    if (!session) {
      res.status(404).json({ error: 'Session not found or access denied.' });
      return;
    }

    const validated = addMessageSchema.parse(req.body);
    const existingMessages = await dbService.getSessionMessages(sessionId);
    const nextSeq = existingMessages.length + 1;

    const message = await dbService.addMessage({
      session_id: sessionId,
      speaker_type: validated.speaker_type,
      speaker_name: validated.speaker_name,
      personality: validated.personality,
      message_text: validated.message_text,
      sequence_number: nextSeq
    });

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:id/finish - Mark session as completed
sessionRouter.post('/:id/finish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessionId = String(req.params.id);

    const session = await dbService.getSessionById(sessionId, userId);
    if (!session) {
      res.status(404).json({ error: 'Session not found or access denied.' });
      return;
    }

    await dbService.updateSessionStatus(sessionId, 'completed');
    res.json({ message: 'Session marked as completed successfully.', sessionId });
  } catch (err) {
    next(err);
  }
});
