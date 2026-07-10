const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, 'Username can only use letters, numbers, dots, dashes and underscores'),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const verifyEmailSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

const resendCodeSchema = z.object({
  email: z.string().email().toLowerCase(),
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
  verifyEmailSchema,
  resendCodeSchema,
  courseQuerySchema,
  progressSchema,
};
