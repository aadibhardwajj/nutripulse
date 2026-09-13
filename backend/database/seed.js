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
    console.log(`Inserted ${insertedFoods.length} foods successfully.`);

    // 3. Create demo user
    console.log('Creating demo user: demo@nutripulse.com / Password123!');
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'demo@nutripulse.com',
      password: 'Password123!',
      role: 'user',
      isPremium: true,
      onboardingCompleted: true,
    });

    // Profile
    await UserProfile.create({
      userId: demoUser._id,
      gender: 'male',
      dateOfBirth: new Date('1996-05-15'),
      heightCm: 180,
      currentWeightKg: 78.5,
      targetWeightKg: 74.0,
      activityLevel: 'moderately_active',
      dietaryPreference: 'standard',
      unitSystem: 'metric',
      themePreference: 'system',
      bio: 'Fitness enthusiast working on clean recomp and cardiovascular health.',
    });

    // Goals (Calculated: TDEE ~ 2600, Deficit goal: 2150 kcal)
    await UserGoal.create({
      userId: demoUser._id,
      goalType: 'lose_weight',
      dailyCalories: 2150,
      targetCarbsGrams: 240,
      targetProteinGrams: 160,
      targetFatGrams: 60,
      targetWaterMl: 3000,
      weeklyExerciseMinutes: 180,
    });

    // Notification Preferences
    await NotificationPreference.create({
      userId: demoUser._id,
      mealReminders: { enabled: true, breakfastTime: '08:00', lunchTime: '13:00', dinnerTime: '19:30' },
      waterReminders: { enabled: true, intervalHours: 2 },
      workoutReminders: { enabled: true, preferredTime: '18:00' },
    });

    // 4. Seed 7 days of diary, water, weight, and exercise logs
    const today = new Date();
    const foodMap = {};
    insertedFoods.forEach((f) => {
      foodMap[f.name] = f;
    });

    console.log('Seeding historical logs for past 7 days...');
    for (let i = 6; i >= 0; i--) {
      const dt = getPastDate(i);

      // Weight log (gradual decline towards target)
      const simulatedWeight = parseFloat((79.2 - (6 - i) * 0.12).toFixed(1));
      await WeightLog.create({
        userId: demoUser._id,
        date: dt,
        weightKg: simulatedWeight,
        notes: i === 0 ? 'Morning weigh-in after workout' : '',
      });

      // Water logs
      const waterAmounts = [500, 500, 750, 500, 250];
      for (const amt of waterAmounts) {
        await WaterLog.create({
          userId: demoUser._id,
          date: dt,
          amountMl: amt,
        });
      }

      // Exercise log
      if (i % 2 === 0) {
        await ExerciseLog.create({
          userId: demoUser._id,
          date: dt,
          exerciseName: i === 0 ? 'Running / Jogging (8 km/h)' : 'Weight Training (Moderate Effort)',
          category: i === 0 ? 'running' : 'strength',
          durationMinutes: 45,
          distanceKm: i === 0 ? 6.0 : 0,
          caloriesBurned: i === 0 ? 420 : 280,
          notes: 'Great energy today!',
        });
      }

      // Food Diary for the day
      const oats = foodMap['Rolled Oats (Whole Grain)'];
      const berries = foodMap['Fresh Blueberries'];
      const whey = foodMap['Whey Protein Isolate (Vanilla)'];
      const chicken = foodMap['Boneless Skinless Chicken Breast (Grilled)'];
      const rice = foodMap['Brown Rice (Cooked)'];
      const broccoli = foodMap['Steamed Broccoli Florets'];
      const salmon = foodMap['Atlantic Salmon Fillet (Baked)'];
      const avocado = foodMap['Fresh Hass Avocado'];
      const apple = foodMap['Crisp Red Apple (with Skin)'];
      const almonds = foodMap['Raw Almonds'];

      const diaryItems = [
        // Breakfast
        {
          foodId: oats._id,
          foodName: oats.name,
          brand: oats.brand,
          mealType: 'breakfast',
          servingSize: 1,
          servingUnit: 'cup (dry)',
          servingWeightGrams: 80,
          quantity: 1,
          calories: 303,
          protein: 10.6,
          carbs: 54.2,
          fat: 5.2,
          fiber: 8.1,
          sugar: 0.8,
          sodium: 5,
        },
        {
          foodId: whey._id,
          foodName: whey.name,
          brand: whey.brand,
          mealType: 'breakfast',
          servingSize: 1,
          servingUnit: 'scoop',
          servingWeightGrams: 30,
          quantity: 1,
          calories: 112,
          protein: 26.0,
          carbs: 1.0,
          fat: 0.4,
          fiber: 0.0,
          sugar: 0.3,
          sodium: 48,
        },
        {
          foodId: berries._id,
          foodName: berries.name,
          brand: berries.brand,
          mealType: 'breakfast',
          servingSize: 1,
          servingUnit: 'cup',
          servingWeightGrams: 148,
          quantity: 0.75,
          calories: 63,
          protein: 0.8,
          carbs: 16.1,
          fat: 0.3,
          fiber: 2.7,
          sugar: 11.0,
          sodium: 1,
        },
        // Lunch
        {
          foodId: chicken._id,
          foodName: chicken.name,
          brand: chicken.brand,
          mealType: 'lunch',
          servingSize: 1,
          servingUnit: 'breast fillet',
          servingWeightGrams: 170,
          quantity: 1,
          calories: 280,
          protein: 52.7,
          carbs: 0.0,
          fat: 6.1,
          fiber: 0.0,
          sugar: 0.0,
          sodium: 126,
        },
        {
          foodId: rice._id,
          foodName: rice.name,
          brand: rice.brand,
          mealType: 'lunch',
          servingSize: 1,
          servingUnit: 'cup',
          servingWeightGrams: 195,
          quantity: 1,
          calories: 240,
          protein: 5.3,
          carbs: 49.9,
          fat: 2.0,
          fiber: 3.1,
          sugar: 0.4,
          sodium: 8,
        },
        {
          foodId: broccoli._id,
          foodName: broccoli.name,
          brand: broccoli.brand,
          mealType: 'lunch',
          servingSize: 1,
          servingUnit: 'cup',
          servingWeightGrams: 156,
          quantity: 1,
          calories: 55,
          protein: 3.7,
          carbs: 11.2,
          fat: 0.6,
          fiber: 5.1,
          sugar: 2.2,
          sodium: 64,
        },
        // Dinner
        {
          foodId: salmon._id,
          foodName: salmon.name,
          brand: salmon.brand,
          mealType: 'dinner',
          servingSize: 1,
          servingUnit: 'fillet',
          servingWeightGrams: 150,
          quantity: 1,
          calories: 309,
          protein: 33.2,
          carbs: 0.0,
          fat: 18.6,
          fiber: 0.0,
          sugar: 0.0,
          sodium: 92,
        },
        {
          foodId: avocado._id,
          foodName: avocado.name,
          brand: avocado.brand,
          mealType: 'dinner',
          servingSize: 0.5,
          servingUnit: 'medium avocado',
          servingWeightGrams: 75,
          quantity: 1,
          calories: 120,
          protein: 1.5,
          carbs: 6.4,
          fat: 11.0,
          fiber: 5.0,
          sugar: 0.5,
          sodium: 5,
        },
        // Snack
        {
          foodId: apple._id,
          foodName: apple.name,
          brand: apple.brand,
          mealType: 'snack',
          servingSize: 1,
          servingUnit: 'medium apple',
          servingWeightGrams: 182,
          quantity: 1,
          calories: 95,
          protein: 0.5,
          carbs: 25.1,
          fat: 0.3,
          fiber: 4.4,
          sugar: 18.9,
          sodium: 2,
        },
        {
          foodId: almonds._id,
          foodName: almonds.name,
          brand: almonds.brand,
          mealType: 'snack',
          servingSize: 1,
          servingUnit: 'handful / oz (28g)',
          servingWeightGrams: 28,
          quantity: 1,
          calories: 162,
          protein: 5.9,
          carbs: 6.0,
          fat: 14.0,
          fiber: 3.5,
          sugar: 1.2,
          sodium: 1,
        },
      ];

      await Diary.create({
        userId: demoUser._id,
        date: dt,
        items: diaryItems,
        note: 'Consistent nutrition day.',
      });
    }

    // 5. Seed Favorite Foods
    await Favorite.create({ userId: demoUser._id, foodId: foodMap['Atlantic Salmon Fillet (Baked)']._id });
    await Favorite.create({ userId: demoUser._id, foodId: foodMap['Rolled Oats (Whole Grain)']._id });
    await Favorite.create({ userId: demoUser._id, foodId: foodMap['Fresh Hass Avocado']._id });

    // 6. Seed Saved Meals
    await Meal.create({
      userId: demoUser._id,
      name: 'Power Post-Workout Breakfast',
      description: 'Oats with whey protein and fresh blueberries',
      defaultMealType: 'breakfast',
      items: [
        {
          foodId: foodMap['Rolled Oats (Whole Grain)']._id,
          foodName: 'Rolled Oats (Whole Grain)',
          servingSize: 1,
          servingUnit: 'cup (dry)',
          servingWeightGrams: 80,
          quantity: 1,
          calories: 303,
          protein: 10.6,
          carbs: 54.2,
          fat: 5.2,
        },
        {
          foodId: foodMap['Whey Protein Isolate (Vanilla)']._id,
          foodName: 'Whey Protein Isolate (Vanilla)',
          servingSize: 1,
          servingUnit: 'scoop',
          servingWeightGrams: 30,
          quantity: 1,
          calories: 112,
          protein: 26.0,
          carbs: 1.0,
          fat: 0.4,
        },
      ],
      totalCalories: 415,
      totalProtein: 36.6,
      totalCarbs: 55.2,
      totalFat: 5.6,
    });

    // 7. Seed Sample Recipe
    await Recipe.create({
      userId: demoUser._id,
      name: 'Mediterranean Salmon & Quinoa Bowl',
      description: 'Pan-seared Atlantic salmon with fluffy quinoa and diced creamy avocado.',
      servings: 2,
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      ingredients: [
        {
          name: 'Atlantic Salmon Fillet (Baked)',
          quantity: 2,
          servingSize: 1,
          servingUnit: 'fillet',
          servingWeightGrams: 150,
          nutrition: { calories: 309, protein: 33.2, carbs: 0, fat: 18.6, fiber: 0, sugar: 0, sodium: 92 },
        },
        {
          name: 'Quinoa (Cooked)',
          quantity: 2,
          servingSize: 1,
          servingUnit: 'cup',
          servingWeightGrams: 185,
          nutrition: { calories: 222, protein: 8.1, carbs: 39.4, fat: 3.5, fiber: 5.2, sugar: 1.6, sodium: 13 },
        },
        {
          name: 'Fresh Hass Avocado',
          quantity: 1,
          servingSize: 1,
          servingUnit: 'medium',
          servingWeightGrams: 150,
          nutrition: { calories: 240, protein: 3.0, carbs: 12.8, fat: 22.0, fiber: 10.0, sugar: 1.0, sodium: 10 },
        },
      ],
      instructions: [
        { step: 1, text: 'Rinse and cook quinoa according to package directions.' },
        { step: 2, text: 'Season salmon fillet with herbs, sea salt, and lemon juice. Sear for 4 minutes per side.' },
        { step: 3, text: 'Slice fresh avocado. Assemble bowls with warm quinoa base and top with salmon.' },
      ],
      totalNutrition: {
        calories: 1302,
        protein: 85.6,
        carbs: 91.6,
        fat: 66.2,
        fiber: 20.4,
        sugar: 4.2,
        sodium: 220,
      },
      perServingNutrition: {
        calories: 651,
        protein: 42.8,
        carbs: 45.8,
        fat: 33.1,
        fiber: 10.2,
        sugar: 2.1,
        sodium: 110,
      },
    });

    // 8. Seed Sample Workout Routine
    await Workout.create({
      userId: demoUser._id,
      name: 'Upper Body Hypertrophy & Core',
      description: 'Focus on chest, back, delts, and core stabilization.',
      estimatedDurationMinutes: 50,
      exercises: [
        {
          name: 'Barbell Bench Press',
          category: 'strength',
          sets: [
            { setNumber: 1, reps: 10, weightKg: 60, completed: true },
            { setNumber: 2, reps: 8, weightKg: 70, completed: true },
            { setNumber: 3, reps: 6, weightKg: 75, completed: true },
          ],
        },
        {
          name: 'Dumbbell Bent-Over Row',
          category: 'strength',
          sets: [
            { setNumber: 1, reps: 12, weightKg: 24, completed: true },
            { setNumber: 2, reps: 10, weightKg: 26, completed: true },
            { setNumber: 3, reps: 10, weightKg: 26, completed: true },
          ],
        },
        {
          name: 'Overhead Shoulder Press',
          category: 'strength',
          sets: [
            { setNumber: 1, reps: 10, weightKg: 40, completed: true },
            { setNumber: 2, reps: 8, weightKg: 45, completed: true },
          ],
        },
      ],
    });

    console.log('========================================================');
    console.log('  Database seeding completed successfully!');
    console.log('  Demo Account: demo@nutripulse.com / Password123!');
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
