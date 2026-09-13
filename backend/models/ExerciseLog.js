const mongoose = require('mongoose');

const exerciseLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    exerciseName: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'walking',
        'running',
        'cycling',
        'swimming',
        'strength',
        'cardio',
        'sports',
        'flexibility',
        'other',
      ],
      default: 'cardio',
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute'],
    },
    distanceKm: {
      type: Number,
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      min: [0, 'Calories burned cannot be negative'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

exerciseLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('ExerciseLog', exerciseLogSchema);
