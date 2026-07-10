const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  level: z.string().optional(),
  search: z.string().optional(),
});

const progressSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  completionPercentage: z.number().min(0).max(100).optional(),
  timeSpentMinutes: z.coerce.number().int().min(0).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  courseQuerySchema,
  progressSchema,
};
