const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
  },
  name: { type: String, required: true },
  servingSize: { type: Number, default: 1 },
  servingUnit: { type: String, default: 'g' },
  servingWeightGrams: { type: Number, default: 100 },
  quantity: { type: Number, default: 1 },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
});

const recipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    servings: {
      type: Number,
      default: 1,
      min: [1, 'Servings must be at least 1'],
    },
    prepTimeMinutes: {
      type: Number,
      default: 15,
    },
    cookTimeMinutes: {
      type: Number,
      default: 15,
    },
    ingredients: [recipeIngredientSchema],
    instructions: [
      {
        step: { type: Number },
        text: { type: String },
      },
    ],
    totalNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
    },
    perServingNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

recipeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);
