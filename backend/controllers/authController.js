const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserGoal = require('../models/UserGoal');
const NotificationPreference = require('../models/NotificationPreference');
const Diary = require('../models/Diary');
const WaterLog = require('../models/WaterLog');
const WeightLog = require('../models/WeightLog');
const ExerciseLog = require('../models/ExerciseLog');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');
const Measurement = require('../models/Measurement');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const calculationService = require('../services/calculationService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_nutripulse_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, 'An account with this email already exists', 400, 'USER_EXISTS');
    }

    const user = await User.create({ name, email, password });

    // Initialize profile, default goals, and notifications
    await UserProfile.create({ userId: user._id });
    await UserGoal.create({ userId: user._id });
    await NotificationPreference.create({ userId: user._id });

    const token = generateToken(user._id);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium,
          onboardingCompleted: user.onboardingCompleted,
        },
      },
      'Account created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user._id);
    const profile = await UserProfile.findOne({ userId: user._id });
    const goals = await UserGoal.findOne({ userId: user._id });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium,
          onboardingCompleted: user.onboardingCompleted,
        },
        profile,
        goals,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  return successResponse(res, {}, 'Logged out successfully');
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await UserProfile.findOne({ userId: req.user._id });
    const goals = await UserGoal.findOne({ userId: req.user._id });
    const notificationPrefs = await NotificationPreference.findOne({ userId: req.user._id });

    return successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        onboardingCompleted: user.onboardingCompleted,
      },
      profile,
      goals,
      notificationPrefs,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/onboarding
const completeOnboarding = async (req, res, next) => {
  try {
    const {
      gender,
      dateOfBirth,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      activityLevel,
      goal,
      dietaryPreference,
    } = req.body;

    // Calculate initial estimated age from DOB or fallback to 28
    let age = 28;
    if (dateOfBirth) {
      const birthYear = new Date(dateOfBirth).getFullYear();
      if (!isNaN(birthYear)) {
        age = Math.max(16, new Date().getFullYear() - birthYear);
      }
    }

    // Compute calorie budget and macro distribution
    const { bmr, tdee, targetCalories } = calculationService.calculateDailyCalories({
      weightKg: currentWeightKg,
      heightCm,
      age,
      gender,
      activityLevel,
      goal,
    });

    const macros = calculationService.calculateMacroTargets(targetCalories);

    // Update Profile
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        activityLevel,
        dietaryPreference: dietaryPreference || 'standard',
      },
      { new: true, upsert: true }
    );

    // Update Goals
    const userGoal = await UserGoal.findOneAndUpdate(
      { userId: req.user._id },
      {
        goalType: goal,
        dailyCalories: macros.calories,
        targetCarbsGrams: macros.carbs,
        targetProteinGrams: macros.protein,
        targetFatGrams: macros.fat,
      },
      { new: true, upsert: true }
    );

    // Mark User onboarding completed
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { onboardingCompleted: true },
      { new: true }
    );

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          onboardingCompleted: user.onboardingCompleted,
        },
        profile,
        goals: userGoal,
        calculations: { bmr, tdee, targetCalories, macros },
      },
      'Onboarding completed successfully'
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password does not match', 400, 'PASSWORD_MISMATCH');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, {}, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/auth/account
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Completely cascade-delete all private records belonging to this user
    await Promise.all([
      User.findByIdAndDelete(userId),
      UserProfile.deleteMany({ userId }),
      UserGoal.deleteMany({ userId }),
      NotificationPreference.deleteMany({ userId }),
      Diary.deleteMany({ userId }),
      WaterLog.deleteMany({ userId }),
      WeightLog.deleteMany({ userId }),
      ExerciseLog.deleteMany({ userId }),
      Workout.deleteMany({ userId }),
      Meal.deleteMany({ userId }),
      Recipe.deleteMany({ userId }),
      Favorite.deleteMany({ userId }),
      Measurement.deleteMany({ userId }),
    ]);

    return successResponse(res, {}, 'Account and all associated health data permanently deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  completeOnboarding,
  changePassword,
  deleteAccount,
};
