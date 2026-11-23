import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { validateUserId, isDemoUser, isValidUuid } from '../src/services/dbService.js';

describe('Storage Routing & User ID Validation', () => {
  it('should identify demo user IDs starting with demo-', () => {
    expect(isDemoUser('demo-qv00ume')).toBe(true);
    expect(isDemoUser('demo-test-user')).toBe(true);
    expect(isDemoUser('demo-12345')).toBe(true);
    expect(isDemoUser('user-12345')).toBe(false);
    expect(isDemoUser('123e4567-e89b-12d3-a456-426614174000')).toBe(false);
  });

  it('should validate genuine UUIDs', () => {
    expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidUuid('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).toBe(true);
    expect(isValidUuid('demo-qv00ume')).toBe(false);
    expect(isValidUuid('invalid-uuid')).toBe(false);
  });

  it('should classify demo and database users consistently via validateUserId', () => {
    expect(validateUserId('demo-qv00ume')).toBe('demo');
    expect(validateUserId('demo-student-aakash')).toBe('demo');
    expect(validateUserId('123e4567-e89b-12d3-a456-426614174000')).toBe('database');
  });

  it('should safely reject arbitrary invalid non-demo IDs without routing to demo mode', () => {
    expect(() => validateUserId('invalid-arbitrary-id')).toThrow(
      /Invalid user identifier format: 'invalid-arbitrary-id'/
    );
    expect(() => validateUserId('random_user_123')).toThrow(
      /Invalid user identifier format/
    );
    expect(() => validateUserId('')).toThrow(/User ID is required/);
    expect(() => validateUserId(undefined)).toThrow(/User ID is required/);
  });
});

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

  it('POST /api/sessions with demo auth (e.g. demo-qv00ume) should create a session and opening turn in memory', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', 'Bearer demo-qv00ume')
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
    expect(res.body.session.user_id).toBe('demo-qv00ume');
    expect(res.body.initialMessage).toBeDefined();
    expect(res.body.initialMessage.speaker_type).toBe('ai');
  });

  it('POST /api/sessions with authenticated user UUID should succeed', async () => {
    const genuineUserId = '123e4567-e89b-12d3-a456-426614174000';
    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${genuineUserId}`)
      .send({
        topic: 'Remote Work vs Office Culture',
        difficulty: 'Advanced',
        duration_minutes: 10,
        participant_count: 3,
        discussion_style: 'Placement preparation',
        selected_personalities: ['analytical', 'collaborative', 'devils_advocate']
      });

    expect(res.status).toBe(201);
    expect(res.body.session).toBeDefined();
    expect(res.body.session.user_id).toBe(genuineUserId);
    expect(res.body.initialMessage).toBeDefined();
  });

  it('POST /api/sessions with invalid non-demo token should be rejected and not routed to demo mode', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', 'Bearer invalid-token-string-123')
      .send({
        topic: 'Ethics in AI',
        difficulty: 'Beginner',
        duration_minutes: 5,
        participant_count: 2,
        selected_personalities: ['analytical', 'devils_advocate']
      });

    // An invalid non-demo, non-UUID identifier is rejected with an error
    expect(res.status).toBeGreaterThanOrEqual(400);
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
