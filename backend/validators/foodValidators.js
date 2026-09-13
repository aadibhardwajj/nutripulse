const { z } = require('zod');

const createFoodSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').max(100),
    brand: z.string().optional().default('Custom'),
    category: z.string().optional().default('Other'),
    servingSize: z.number().positive().default(1),
    servingUnit: z.string().default('serving'),
    servingWeightGrams: z.number().positive().default(100),
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0).optional().default(0),
    sugar: z.number().min(0).optional().default(0),
    sodium: z.number().min(0).optional().default(0),
  }),
});

module.exports = { createFoodSchema };
