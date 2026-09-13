const { z } = require('zod');

const addDiaryItemSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    foodId: z.string().min(1, 'Food ID is required'),
    foodName: z.string().min(1, 'Food name is required'),
    brand: z.string().optional().default(''),
    servingSize: z.number().positive(),
    servingUnit: z.string().min(1),
    servingWeightGrams: z.number().positive(),
    quantity: z.number().positive('Quantity must be greater than 0'),
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().optional().default(0),
    sugar: z.number().optional().default(0),
    sodium: z.number().optional().default(0),
  }),
});

const updateDiaryItemSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
    quantity: z.number().positive().optional(),
    servingSize: z.number().positive().optional(),
    servingUnit: z.string().optional(),
    servingWeightGrams: z.number().positive().optional(),
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbs: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
  }),
});

module.exports = { addDiaryItemSchema, updateDiaryItemSchema };
