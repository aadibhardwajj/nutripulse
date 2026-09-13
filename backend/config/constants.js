const CONSTANTS = {
  MEAL_TYPES: ['breakfast', 'lunch', 'dinner', 'snack'],
  GOAL_TYPES: ['lose_weight', 'maintain_weight', 'gain_weight', 'improve_nutrition', 'improve_fitness'],
  ACTIVITY_LEVELS: {
    sedentary: { label: 'Sedentary (desk job, little exercise)', multiplier: 1.2 },
    lightly_active: { label: 'Lightly Active (1-3 days/week light exercise)', multiplier: 1.375 },
    moderately_active: { label: 'Moderately Active (3-5 days/week moderate exercise)', multiplier: 1.55 },
    very_active: { label: 'Very Active (6-7 days/week hard exercise/athlete)', multiplier: 1.725 },
    extra_active: { label: 'Extra Active (intense manual labor or training 2x/day)', multiplier: 1.9 },
  },
  GENDER_OPTIONS: ['male', 'female', 'other'],
  THEME_MODES: ['light', 'dark', 'system'],
  UNIT_SYSTEMS: ['metric', 'imperial'],
  EXERCISE_CATEGORIES: [
    'walking',
    'running',
    'cycling',
    'swimming',
    'strength',
    'cardio',
    'sports',
    'flexibility',
    'other'
  ],
  DEFAULT_WATER_TARGET_ML: 2500,
  DEFAULT_CALORIE_TARGET: 2000,
  DEFAULT_MACRO_RATIOS: {
    carbsPct: 50,
    proteinPct: 25,
    fatPct: 25,
  }
};

module.exports = CONSTANTS;
