import { Router, Request, Response, NextFunction } from 'express';
import { dbService } from '../services/dbService.js';

export const analyticsRouter = Router();

// GET /api/analytics - Performance and progress analytics
analyticsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const analytics = await dbService.getUserAnalytics(userId);
    res.json({ analytics });
  } catch (err) {
    next(err);
  }
});
