require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserGoal = require('../models/UserGoal');
const NotificationPreference = require('../models/NotificationPreference');
const Food = require('../models/Food');
const Diary = require('../models/Diary');
const Meal = require('../models/Meal');
const Recipe = require('../models/Recipe');
const ExerciseLog = require('../models/ExerciseLog');
const Workout = require('../models/Workout');
const WaterLog = require('../models/WaterLog');
const WeightLog = require('../models/WeightLog');
const Favorite = require('../models/Favorite');
const { formatDateString, getPastDate } = require('../utils/dateHelper');

const DEMO_FOODS = [
  // Grains & Cereals
  {
    name: 'Rolled Oats (Whole Grain)',
    brand: 'Generic / Whole Food',
    category: 'Grains & Cereals',
    servings: [
      { servingSize: 1, servingUnit: 'cup (dry)', weightGrams: 80 },
      { servingSize: 0.5, servingUnit: 'cup (dry)', weightGrams: 40 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 379, protein: 13.2, carbs: 67.7, fat: 6.5, fiber: 10.1, sugar: 1.0, sodium: 6 },
    isVerified: true,
  },
  {
    name: 'Brown Rice (Cooked)',
    brand: 'Generic / Whole Food',
    category: 'Grains & Cereals',
    servings: [
      { servingSize: 1, servingUnit: 'cup', weightGrams: 195 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 123, protein: 2.7, carbs: 25.6, fat: 1.0, fiber: 1.6, sugar: 0.2, sodium: 4 },
    isVerified: true,
  },
  {
    name: 'Whole Wheat Bread Slice',
    brand: 'Artisan Bakery',
    category: 'Grains & Cereals',
    servings: [
      { servingSize: 1, servingUnit: 'slice', weightGrams: 40 },
      { servingSize: 2, servingUnit: 'slices', weightGrams: 80 },
    ],
    nutritionPer100g: { calories: 247, protein: 12.0, carbs: 41.3, fat: 3.4, fiber: 7.0, sugar: 4.2, sodium: 450 },
    isVerified: true,
  },
  {
    name: 'Quinoa (Cooked)',
    brand: 'Generic / Whole Food',
    category: 'Grains & Cereals',
    servings: [
      { servingSize: 1, servingUnit: 'cup', weightGrams: 185 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 },
    isVerified: true,
  },

  // Meat & Poultry
  {
    name: 'Boneless Skinless Chicken Breast (Grilled)',
    brand: 'Fresh Farm',
    category: 'Meat & Poultry',
    servings: [
      { servingSize: 1, servingUnit: 'breast fillet', weightGrams: 170 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
      { servingSize: 150, servingUnit: 'g', weightGrams: 150 },
    ],
    nutritionPer100g: { calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0, sugar: 0.0, sodium: 74 },
    isVerified: true,
  },
  {
    name: 'Lean Ground Turkey (93/7 Cooked)',
    brand: 'Fresh Farm',
    category: 'Meat & Poultry',
    servings: [
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
      { servingSize: 150, servingUnit: 'g', weightGrams: 150 },
    ],
    nutritionPer100g: { calories: 198, protein: 27.2, carbs: 0.0, fat: 9.3, fiber: 0.0, sugar: 0.0, sodium: 88 },
    isVerified: true,
  },
  {
    name: 'Grass-Fed Sirloin Steak (Lean, Grilled)',
    brand: 'Prime Cuts',
    category: 'Meat & Poultry',
    servings: [
      { servingSize: 1, servingUnit: 'steak (6 oz)', weightGrams: 170 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 205, protein: 30.6, carbs: 0.0, fat: 8.4, fiber: 0.0, sugar: 0.0, sodium: 56 },
    isVerified: true,
  },

  // Seafood
  {
    name: 'Atlantic Salmon Fillet (Baked)',
    brand: 'Ocean Fresh',
    category: 'Seafood',
    servings: [
      { servingSize: 1, servingUnit: 'fillet', weightGrams: 150 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 206, protein: 22.1, carbs: 0.0, fat: 12.4, fiber: 0.0, sugar: 0.0, sodium: 61 },
    isVerified: true,
  },
  {
    name: 'Canned Tuna in Water (Drained)',
    brand: 'Ocean Bounty',
    category: 'Seafood',
    servings: [
      { servingSize: 1, servingUnit: 'can (drained)', weightGrams: 120 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 116, protein: 25.5, carbs: 0.0, fat: 0.8, fiber: 0.0, sugar: 0.0, sodium: 335 },
    isVerified: true,
  },

  // Dairy & Eggs
  {
    name: 'Large Whole Egg (Boiled or Poached)',
    brand: 'Pasture Raised',
    category: 'Dairy & Eggs',
    servings: [
      { servingSize: 1, servingUnit: 'large egg', weightGrams: 50 },
      { servingSize: 2, servingUnit: 'large eggs', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0.0, sugar: 0.4, sodium: 142 },
    isVerified: true,
  },
  {
    name: 'Egg Whites (Liquid or Cooked)',
    brand: 'Pasture Raised',
    category: 'Dairy & Eggs',
    servings: [
      { servingSize: 0.5, servingUnit: 'cup', weightGrams: 120 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0.0, sugar: 0.7, sodium: 166 },
    isVerified: true,
  },
  {
    name: 'Greek Yogurt 0% Fat (Plain)',
    brand: 'Alpine Dairy',
    category: 'Dairy & Eggs',
    servings: [
      { servingSize: 1, servingUnit: 'cup (170g)', weightGrams: 170 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 59, protein: 10.2, carbs: 3.6, fat: 0.4, fiber: 0.0, sugar: 3.2, sodium: 36 },
    isVerified: true,
  },
  {
    name: 'Low-Fat Cottage Cheese (2%)',
    brand: 'Dairy Pure',
    category: 'Dairy & Eggs',
    servings: [
      { servingSize: 0.5, servingUnit: 'cup', weightGrams: 113 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 84, protein: 11.0, carbs: 4.3, fat: 2.3, fiber: 0.0, sugar: 3.9, sodium: 364 },
    isVerified: true,
  },

  // Fruits
  {
    name: 'Fresh Banana',
    brand: 'Generic / Whole Food',
    category: 'Fruits',
    servings: [
      { servingSize: 1, servingUnit: 'medium (118g)', weightGrams: 118 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1 },
    isVerified: true,
  },
  {
    name: 'Fresh Blueberries',
    brand: 'Generic / Whole Food',
    category: 'Fruits',
    servings: [
      { servingSize: 1, servingUnit: 'cup', weightGrams: 148 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 9.9, sodium: 1 },
    isVerified: true,
  },
  {
    name: 'Crisp Red Apple (with Skin)',
    brand: 'Generic / Whole Food',
    category: 'Fruits',
    servings: [
      { servingSize: 1, servingUnit: 'medium apple', weightGrams: 182 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1 },
    isVerified: true,
  },

  // Vegetables
  {
    name: 'Fresh Baby Spinach',
    brand: 'Organic Greens',
    category: 'Vegetables',
    servings: [
      { servingSize: 2, servingUnit: 'cups (fresh)', weightGrams: 60 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
    isVerified: true,
  },
  {
    name: 'Steamed Broccoli Florets',
    brand: 'Organic Greens',
    category: 'Vegetables',
    servings: [
      { servingSize: 1, servingUnit: 'cup', weightGrams: 156 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3, sugar: 1.4, sodium: 41 },
    isVerified: true,
  },
  {
    name: 'Fresh Hass Avocado',
    brand: 'Generic / Whole Food',
    category: 'Vegetables',
    servings: [
      { servingSize: 0.5, servingUnit: 'medium avocado', weightGrams: 75 },
      { servingSize: 1, servingUnit: 'medium avocado', weightGrams: 150 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7, sodium: 7 },
    isVerified: true,
  },

  // Legumes & Nuts
  {
    name: 'Raw Almonds',
    brand: 'Harvest Farms',
    category: 'Legumes & Nuts',
    servings: [
      { servingSize: 1, servingUnit: 'handful / oz (28g)', weightGrams: 28 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4, sodium: 1 },
    isVerified: true,
  },
  {
    name: 'Natural Peanut Butter (No added sugar)',
    brand: 'NutriPulse Botanicals',
    category: 'Legumes & Nuts',
    servings: [
      { servingSize: 2, servingUnit: 'tbsp', weightGrams: 32 },
      { servingSize: 1, servingUnit: 'tbsp', weightGrams: 16 },
    ],
    nutritionPer100g: { calories: 588, protein: 25.1, carbs: 20.0, fat: 50.4, fiber: 8.0, sugar: 6.0, sodium: 17 },
    isVerified: true,
  },
  {
    name: 'Cooked Black Beans',
    brand: 'Generic / Whole Food',
    category: 'Legumes & Nuts',
    servings: [
      { servingSize: 1, servingUnit: 'cup', weightGrams: 172 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7, sugar: 0.3, sodium: 2 },
    isVerified: true,
  },

  // Supplements & Beverages
  {
    name: 'Whey Protein Isolate (Vanilla)',
    brand: 'NutriPulse Performance',
    category: 'Beverages',
    servings: [
      { servingSize: 1, servingUnit: 'scoop', weightGrams: 30 },
      { servingSize: 100, servingUnit: 'g', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 373, protein: 86.7, carbs: 3.3, fat: 1.3, fiber: 0.0, sugar: 1.0, sodium: 160 },
    isVerified: true,
  },
  {
    name: 'Unsweetened Almond Milk',
    brand: 'Nature Plant',
    category: 'Beverages',
    servings: [
      { servingSize: 1, servingUnit: 'cup (240ml)', weightGrams: 240 },
      { servingSize: 100, servingUnit: 'ml', weightGrams: 100 },
    ],
    nutritionPer100g: { calories: 13, protein: 0.4, carbs: 0.3, fat: 1.1, fiber: 0.2, sugar: 0.0, sodium: 70 },
    isVerified: true,
  },
  {
    name: 'Extra Virgin Olive Oil',
    brand: 'Mediterranean Gold',
    category: 'Condiments & Sauces',
    servings: [
      { servingSize: 1, servingUnit: 'tbsp (14g)', weightGrams: 14 },
      { servingSize: 1, servingUnit: 'tsp (4.5g)', weightGrams: 4.5 },
    ],
    nutritionPer100g: { calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, sugar: 0.0, sodium: 2 },
    isVerified: true,
  },
];

const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
      const err = new Error('Database seeding is blocked in production to protect user data. Set ALLOW_PROD_SEED=1 to override.');
      console.error(err.message);
      throw err;
    }

    console.log('Starting NutriPulse Database Seed Process...');
    await connectDB();

    // 1. Clear existing demo foods & demo user without deleting custom user foods
    console.log('Safely cleaning previous demo data...');
    const existingDemoUser = await User.findOne({ email: 'demo@nutripulse.com' });
    if (existingDemoUser) {
      const demoId = existingDemoUser._id;
      await Promise.all([
        UserProfile.deleteMany({ userId: demoId }),
        UserGoal.deleteMany({ userId: demoId }),
        NotificationPreference.deleteMany({ userId: demoId }),
        Diary.deleteMany({ userId: demoId }),
        WaterLog.deleteMany({ userId: demoId }),
        WeightLog.deleteMany({ userId: demoId }),
        ExerciseLog.deleteMany({ userId: demoId }),
        Workout.deleteMany({ userId: demoId }),
        Meal.deleteMany({ userId: demoId }),
        Recipe.deleteMany({ userId: demoId }),
        Favorite.deleteMany({ userId: demoId }),
        User.findByIdAndDelete(demoId),
      ]);
    }

    // Remove only system/demo foods so custom user-created foods are preserved
    await Food.deleteMany({ createdBy: null, isCustom: false });

    // 2. Insert standard demo foods
    console.log(`Inserting ${DEMO_FOODS.length} verified standard nutrition foods...`);
    const insertedFoods = await Food.insertMany(DEMO_FOODS);
    console.log('========================================================');
    console.log('  Database food seeding completed successfully!');
    console.log(`  Seeded ${insertedFoods.length} verified standard nutrition items.`);
    console.log('========================================================');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    if (require.main === module) {
      await disconnectDB();
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
