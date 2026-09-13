const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserGoal = require('../models/UserGoal');
const NotificationPreference = require('../models/NotificationPreference');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [user, profile, goals, notificationPrefs] = await Promise.all([
      User.findById(userId),
      UserProfile.findOne({ userId }),
      UserGoal.findOne({ userId }),
      NotificationPreference.findOne({ userId }),
    ]);

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

// PATCH /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, bio, gender, dateOfBirth, heightCm, currentWeightKg, targetWeightKg, activityLevel, unitSystem, themePreference } = req.body;

    if (name) {
      await User.findByIdAndUpdate(userId, { name });
    }

    const profileUpdates = {};
    if (bio !== undefined) profileUpdates.bio = bio;
    if (gender) profileUpdates.gender = gender;
    if (dateOfBirth) profileUpdates.dateOfBirth = new Date(dateOfBirth);
    if (heightCm) profileUpdates.heightCm = heightCm;
    if (currentWeightKg) profileUpdates.currentWeightKg = currentWeightKg;
    if (targetWeightKg) profileUpdates.targetWeightKg = targetWeightKg;
    if (activityLevel) profileUpdates.activityLevel = activityLevel;
    if (unitSystem) profileUpdates.unitSystem = unitSystem;
    if (themePreference) profileUpdates.themePreference = themePreference;

    const profile = await UserProfile.findOneAndUpdate({ userId }, profileUpdates, { new: true, upsert: true });

    return successResponse(res, { profile }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/profile/goals
const updateGoals = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { goalType, dailyCalories, targetCarbsGrams, targetProteinGrams, targetFatGrams, targetWaterMl, weeklyExerciseMinutes } = req.body;

    const goalUpdates = {};
    if (goalType) goalUpdates.goalType = goalType;
    if (dailyCalories) goalUpdates.dailyCalories = dailyCalories;
    if (targetCarbsGrams) goalUpdates.targetCarbsGrams = targetCarbsGrams;
    if (targetProteinGrams) goalUpdates.targetProteinGrams = targetProteinGrams;
    if (targetFatGrams) goalUpdates.targetFatGrams = targetFatGrams;
    if (targetWaterMl) goalUpdates.targetWaterMl = targetWaterMl;
    if (weeklyExerciseMinutes) goalUpdates.weeklyExerciseMinutes = weeklyExerciseMinutes;

    const goals = await UserGoal.findOneAndUpdate({ userId }, goalUpdates, { new: true, upsert: true });

    return successResponse(res, { goals }, 'Goals updated successfully');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/profile/notifications
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { mealReminders, waterReminders, workoutReminders, weeklyProgressDigest } = req.body;

    const updates = {};
    if (mealReminders !== undefined) updates.mealReminders = mealReminders;
    if (waterReminders !== undefined) updates.waterReminders = waterReminders;
    if (workoutReminders !== undefined) updates.workoutReminders = workoutReminders;
    if (weeklyProgressDigest !== undefined) updates.weeklyProgressDigest = weeklyProgressDigest;

    const prefs = await NotificationPreference.findOneAndUpdate({ userId }, updates, { new: true, upsert: true });

    return successResponse(res, { notificationPrefs: prefs }, 'Notification preferences updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateGoals,
  updateNotificationPreferences,
};
