const mongoose = require('mongoose');

const diaryItemSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: '',
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    servingSize: {
      type: Number,
      required: true,
      default: 1,
    },
    servingUnit: {
      type: String,
      required: true,
      default: 'serving',
    },
    servingWeightGrams: {
      type: Number,
      required: true,
      default: 100,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [0.1, 'Quantity must be at least 0.1'],
    },
    calories: {
      type: Number,
      required: true,
      default: 0,
    },
    protein: {
      type: Number,
      required: true,
      default: 0,
    },
    carbs: {
      type: Number,
      required: true,
      default: 0,
    },
    fat: {
      type: Number,
      required: true,
      default: 0,
    },
    fiber: {
      type: Number,
      default: 0,
    },
    sugar: {
      type: Number,
      default: 0,
    },
    sodium: {
      type: Number,
      default: 0,
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const diarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // Normalized 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    items: [diaryItemSchema],
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for fast queries by user and date
diarySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Diary', diarySchema);
