const mongoose = require('mongoose');

const userGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    goalType: {
      type: String,
      enum: ['lose_weight', 'maintain_weight', 'gain_weight', 'improve_nutrition', 'improve_fitness'],
      default: 'maintain_weight',
    },
    dailyCalories: {
      type: Number,
      default: 2000,
      min: 1000,
      max: 10000,
    },
    targetCarbsGrams: {
      type: Number,
      default: 250,
    },
    targetProteinGrams: {
      type: Number,
      default: 125,
    },
    targetFatGrams: {
      type: Number,
      default: 55,
    },
    targetWaterMl: {
      type: Number,
      default: 2500,
      min: 500,
      max: 10000,
    },
    weeklyExerciseMinutes: {
      type: Number,
      default: 150,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserGoal', userGoalSchema);
