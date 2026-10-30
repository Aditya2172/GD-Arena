import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Sessions & Analytics REST APIs', () => {
  it('GET /api/health should respond with healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/sessions without auth should return 401', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({
        topic: 'AI and Jobs',
        difficulty: 'Beginner',
        duration_minutes: 5,
        participant_count: 2,
        selected_personalities: ['analytical', 'devils_advocate']
      });

    expect(res.status).toBe(401);
  });

  it('POST /api/sessions with demo auth should create a session and opening turn', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', 'Bearer demo-test-user')
      .send({
        topic: 'AI and the Future of Jobs',
        difficulty: 'Intermediate',
        duration_minutes: 5,
        participant_count: 2,
        discussion_style: 'Placement preparation',
        selected_personalities: ['analytical', 'devils_advocate']
      });

    expect(res.status).toBe(201);
    expect(res.body.session).toBeDefined();
    expect(res.body.session.topic).toBe('AI and the Future of Jobs');
    expect(res.body.initialMessage).toBeDefined();
    expect(res.body.initialMessage.speaker_type).toBe('ai');
  });

  it('GET /api/analytics with demo auth should return analytics object', async () => {
    const res = await request(app)
      .get('/api/analytics')
      .set('Authorization', 'Bearer demo-test-user');

    expect(res.status).toBe(200);
    expect(res.body.analytics).toBeDefined();
    expect(Array.isArray(res.body.analytics.radarScores)).toBe(true);
  });
});
