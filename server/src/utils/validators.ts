import { z } from 'zod';

export const createSessionSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long').max(200),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  duration_minutes: z.union([z.literal(5), z.literal(10), z.literal(15)]),
  participant_count: z.number().int().min(2).max(4),
  discussion_style: z.enum([
    'Placement preparation',
    'College debate',
    'General awareness',
    'Professional communication'
  ]).default('Placement preparation'),
  language: z.string().default('English'),
  selected_personalities: z.array(z.enum([
    'analytical',
    'devils_advocate',
    'collaborative',
    'confident',
    'practical',
    'synthesizer'
  ])).min(2).max(4)
});

export const addMessageSchema = z.object({
  message_text: z.string().min(1, 'Message text cannot be empty').max(2000),
  speaker_type: z.enum(['user', 'ai', 'system']),
  speaker_name: z.string().min(1).max(100),
  personality: z.enum(['analytical', 'devils_advocate', 'collaborative', 'confident', 'practical', 'synthesizer']).optional()
});

export const generateResponseSchema = z.object({
  userMessage: z.string().max(2000).optional(),
  currentSpeakerId: z.string().optional()
});
