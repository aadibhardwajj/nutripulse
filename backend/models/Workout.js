const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number, default: 10 },
  weightKg: { type: Number, default: 0 },
  completed: { type: Boolean, default: true },
});

const workoutExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'strength' },
  sets: [setSchema],
  notes: { type: String, default: '' },
});

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Workout routine name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    exercises: [workoutExerciseSchema],
    estimatedDurationMinutes: {
      type: Number,
      default: 45,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workout', workoutSchema);
