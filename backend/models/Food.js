const mongoose = require('mongoose');

const foodServingSchema = new mongoose.Schema({
  servingSize: { type: Number, required: true, default: 1 },
  servingUnit: { type: String, required: true, default: 'serving' }, // e.g., 'cup', 'slice', '100g', 'tbsp'
  weightGrams: { type: Number, required: true, default: 100 },
});

const foodNutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true, default: 0 },
  protein: { type: Number, required: true, default: 0 },
  carbs: { type: Number, required: true, default: 0 },
  fat: { type: Number, required: true, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 }, // in mg
  saturatedFat: { type: Number, default: 0 },
  cholesterol: { type: Number, default: 0 }, // in mg
  potassium: { type: Number, default: 0 }, // in mg
});

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      index: 'text',
    },
    brand: {
      type: String,
      default: 'Generic / Whole Food',
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Fruits',
        'Vegetables',
        'Grains & Cereals',
        'Dairy & Eggs',
        'Meat & Poultry',
        'Seafood',
        'Legumes & Nuts',
        'Snacks & Sweets',
        'Beverages',
        'Condiments & Sauces',
        'Prepared Meals',
        'Other',
      ],
      default: 'Other',
      index: true,
    },
    servings: [foodServingSchema],
    defaultServingIndex: {
      type: Number,
      default: 0,
    },
    // Nutrition values are per 100g base or per default serving
    nutritionPer100g: {
      type: foodNutritionSchema,
      required: true,
    },
    barcode: {
      type: String,
      sparse: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    source: {
      type: String,
      default: 'NutriPulse Database',
    },
  },
  { timestamps: true }
);

// Text search index for high performance food lookup
foodSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Food', foodSchema);
