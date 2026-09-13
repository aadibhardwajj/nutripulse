export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: 'Sun', description: 'Kickstart your metabolism' },
  { key: 'lunch', label: 'Lunch', icon: 'SunMedium', description: 'Midday sustained energy' },
  { key: 'dinner', label: 'Dinner', icon: 'Moon', description: 'Nourish & recover' },
  { key: 'snack', label: 'Snacks', icon: 'Apple', description: 'Smart between-meal fuel' },
];

export const FOOD_CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Grains & Cereals',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Seafood',
  'Legumes & Nuts',
  'Snacks & Sweets',
  'Beverages',
  'Condiments & Sauces',
  'Prepared Meals',
  'Other',
];

export const EXERCISE_CATEGORIES = [
  { key: 'walking', label: 'Walking' },
  { key: 'running', label: 'Running' },
  { key: 'cycling', label: 'Cycling' },
  { key: 'swimming', label: 'Swimming' },
  { key: 'strength', label: 'Strength / Lifting' },
  { key: 'cardio', label: 'Cardio / HIIT' },
  { key: 'sports', label: 'Sports & Games' },
  { key: 'flexibility', label: 'Yoga & Flexibility' },
  { key: 'other', label: 'Other Activities' },
];

export const GOAL_TYPES = [
  { value: 'lose_weight', label: 'Lose Weight', desc: 'Sustainable deficit of ~500 kcal/day' },
  { value: 'maintain_weight', label: 'Maintain Weight', desc: 'Balance intake with daily expenditure' },
  { value: 'gain_weight', label: 'Build Muscle / Gain', desc: 'Surplus of ~400 kcal/day' },
  { value: 'improve_nutrition', label: 'Improve Nutrition', desc: 'Focus on balanced macros & quality' },
  { value: 'improve_fitness', label: 'Boost Athletic Fitness', desc: 'Fuel performance and recovery' },
];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise, desk job' },
  { value: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise or walking 1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Intense training 6-7 days/week' },
  { value: 'extra_active', label: 'Extra Active', desc: 'Physical job or two-a-day workouts' },
];
