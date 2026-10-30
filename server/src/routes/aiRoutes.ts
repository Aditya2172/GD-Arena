import { Router, Request, Response, NextFunction } from 'express';
import { dbService } from '../services/dbService.js';
import { orchestrationService } from '../services/orchestrationService.js';
import { reportService } from '../services/reportService.js';

export const aiRouter = Router();

// POST /api/sessions/:id/respond - Generate next context-aware AI participant response
aiRouter.post('/:id/respond', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessionId = String(req.params.id);
    const { userMessage } = req.body;

    const session = await dbService.getSessionById(sessionId, userId);
    if (!session) {
      res.status(404).json({ error: 'Session not found or access denied.' });
      return;
    }

    // If user provided a message in the body, persist it first
    if (userMessage && typeof userMessage === 'string' && userMessage.trim().length > 0) {
      const messages = await dbService.getSessionMessages(sessionId);
      await dbService.addMessage({
        session_id: sessionId,
        speaker_type: 'user',
        speaker_name: req.user?.displayName || 'Candidate',
        message_text: userMessage.trim(),
        sequence_number: messages.length + 1
      });
    }

    // Fetch refreshed conversation history
    const history = await dbService.getSessionMessages(sessionId);

    // Orchestrate turn: select speaker & generate text
    const { speaker, text } = await orchestrationService.generateNextTurn(session, history);

    // Save AI response message
    const savedMessage = await dbService.addMessage({
      session_id: sessionId,
      speaker_type: 'ai',
      speaker_name: speaker.name,
      personality: speaker.id,
      message_text: text,
      sequence_number: history.length + 1
    });

    res.json({
      message: savedMessage,
      speaker: {
        id: speaker.id,
        name: speaker.name,
        roleTitle: speaker.roleTitle,
        avatar: speaker.avatar,
        speechRate: speaker.speechRate,
        speechPitch: speaker.speechPitch
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:id/report - Generate or retrieve evaluation report
aiRouter.post('/:id/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessionId = String(req.params.id);

    const session = await dbService.getSessionById(sessionId, userId);
    if (!session) {
      res.status(404).json({ error: 'Session not found or access denied.' });
      return;
    }

    // Check if report already exists
    const existing = await dbService.getReportBySessionId(sessionId, userId);
    if (existing) {
      res.json({ report: existing });
      return;
    }

    // Ensure session is marked as completed
    await dbService.updateSessionStatus(sessionId, 'completed');

    // Fetch messages & generate report
    const messages = await dbService.getSessionMessages(sessionId);
    const newReportData = await reportService.generateReport(session, messages, userId);
    const savedReport = await dbService.saveReport(newReportData);

    res.status(201).json({ report: savedReport });
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:id/report - Retrieve session report
aiRouter.get('/:id/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sessionId = String(req.params.id);

    const report = await dbService.getReportBySessionId(sessionId, userId);
    if (!report) {
      res.status(404).json({ error: 'Report not found for this session.' });
      return;
    }

    res.json({ report });
  } catch (err) {
    next(err);
  }
});
