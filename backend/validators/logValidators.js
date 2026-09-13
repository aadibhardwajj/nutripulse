const { z } = require('zod');

const logExerciseSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    exerciseName: z.string().min(1, 'Exercise name is required'),
    category: z.enum(['walking', 'running', 'cycling', 'swimming', 'strength', 'cardio', 'sports', 'flexibility', 'other']).default('cardio'),
    durationMinutes: z.number().min(1),
    distanceKm: z.number().min(0).optional().default(0),
    caloriesBurned: z.number().min(0),
    notes: z.string().optional().default(''),
  }),
});

const logWaterSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    amountMl: z.number().min(1, 'Water amount must be greater than 0'),
  }),
});

const logWeightSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    weightKg: z.number().min(20).max(500),
    notes: z.string().optional().default(''),
  }),
});

const logMeasurementSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    waistCm: z.number().optional(),
    chestCm: z.number().optional(),
    hipsCm: z.number().optional(),
    armsCm: z.number().optional(),
    thighsCm: z.number().optional(),
    notes: z.string().optional(),
  }),
});

const createMealSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Meal name is required'),
    description: z.string().optional().default(''),
    defaultMealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).default('breakfast'),
    items: z.array(
      z.object({
        foodId: z.string(),
        foodName: z.string(),
        servingSize: z.number().default(1),
        servingUnit: z.string().default('serving'),
        servingWeightGrams: z.number().default(100),
        quantity: z.number().default(1),
        calories: z.number().default(0),
        protein: z.number().default(0),
        carbs: z.number().default(0),
        fat: z.number().default(0),
      })
    ).min(1, 'At least one food item is required'),
  }),
});

const createRecipeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Recipe name is required'),
    description: z.string().optional().default(''),
    servings: z.number().min(1).default(1),
    prepTimeMinutes: z.number().default(15),
    cookTimeMinutes: z.number().default(15),
    ingredients: z.array(
      z.object({
        name: z.string(),
        quantity: z.number().default(1),
        servingSize: z.number().default(1),
        servingUnit: z.string().default('serving'),
        servingWeightGrams: z.number().default(100),
        nutrition: z.object({
          calories: z.number().default(0),
          protein: z.number().default(0),
          carbs: z.number().default(0),
          fat: z.number().default(0),
          fiber: z.number().optional().default(0),
          sugar: z.number().optional().default(0),
          sodium: z.number().optional().default(0),
        }),
      })
    ).min(1, 'At least one ingredient is required'),
    instructions: z.array(
      z.object({
        step: z.number(),
        text: z.string(),
      })
    ).optional().default([]),
  }),
});

module.exports = {
  logExerciseSchema,
  logWaterSchema,
  logWeightSchema,
  logMeasurementSchema,
  createMealSchema,
  createRecipeSchema,
};
