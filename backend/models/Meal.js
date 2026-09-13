const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  foodName: { type: String, required: true },
  servingSize: { type: Number, default: 1 },
  servingUnit: { type: String, default: 'serving' },
  servingWeightGrams: { type: Number, default: 100 },
  quantity: { type: Number, default: 1 },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    defaultMealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'breakfast',
    },
    items: [mealItemSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mealSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Meal', mealSchema);
