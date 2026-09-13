const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

const onboardingSchema = z.object({
  body: z.object({
    gender: z.enum(['male', 'female', 'other']),
    dateOfBirth: z.string().optional(),
    heightCm: z.number().min(50).max(300),
    currentWeightKg: z.number().min(20).max(500),
    targetWeightKg: z.number().min(20).max(500),
    activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
    goal: z.enum(['lose_weight', 'maintain_weight', 'gain_weight', 'improve_nutrition', 'improve_fitness']),
    dietaryPreference: z.enum(['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'pescatarian', 'low_carb']).optional(),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  onboardingSchema,
};
