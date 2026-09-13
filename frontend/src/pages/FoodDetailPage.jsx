import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, Plus, Check } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const [quantity, setQuantity] = useState(1);
  const [selectedServingIdx, setSelectedServingIdx] = useState(0);
  const [mealType, setMealType] = useState('breakfast');

  const { data: foodRes, isLoading } = useQuery({
    queryKey: ['foodDetail', id],
    queryFn: () => api.get(`/foods/${id}`),
  });

  const food = foodRes?.data?.food;
  const isFavorite = foodRes?.data?.isFavorite;

  // Favorite toggle mutation
  const favoriteMutation = useMutation({
    mutationFn: () => api.post(`/foods/${id}/favorite`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['foodDetail', id] });
      addToast(res.message, 'success');
    },
  });

  // Log food mutation
  const logMutation = useMutation({
    mutationFn: (payload) => api.post('/diary/items', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast(`Logged ${food.name} to ${mealType}!`, 'success');
      navigate('/diary');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Card className="p-8 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </Card>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-3">
        <p className="text-base font-bold">Food item not found.</p>
        <Link to="/foods">
          <Button variant="outline" size="sm">
            Back to Food Search
          </Button>
        </Link>
      </div>
    );
  }

  const serving = food.servings?.[selectedServingIdx] || {
    servingSize: 1,
    servingUnit: 'serving',
    weightGrams: 100,
  };

  const ratio = (serving.weightGrams / 100) * quantity;
  const nut = food.nutritionPer100g || {};

  const currentNutrition = {
    calories: Math.round((nut.calories || 0) * ratio),
    protein: parseFloat(((nut.protein || 0) * ratio).toFixed(1)),
    carbs: parseFloat(((nut.carbs || 0) * ratio).toFixed(1)),
    fat: parseFloat(((nut.fat || 0) * ratio).toFixed(1)),
    fiber: parseFloat(((nut.fiber || 0) * ratio).toFixed(1)),
    sugar: parseFloat(((nut.sugar || 0) * ratio).toFixed(1)),
    sodium: Math.round((nut.sodium || 0) * ratio),
  };

  const handleLog = () => {
    logMutation.mutate({
      date: selectedDate,
      mealType,
      foodId: food._id,
      foodName: food.name,
      brand: food.brand,
      servingSize: serving.servingSize,
      servingUnit: serving.servingUnit,
      servingWeightGrams: serving.weightGrams,
      quantity: Number(quantity),
      ...currentNutrition,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/foods"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Database
        </Link>

        <button
          onClick={() => favoriteMutation.mutate()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
            isFavorite
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
        </button>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {food.name}
            </h1>
            {food.isVerified && <Badge variant="emerald">Verified Nutrition</Badge>}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {food.brand} • {food.category}
          </p>
        </div>

        {/* Portion Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Serving Unit
            </label>
            <select
              value={selectedServingIdx}
              onChange={(e) => setSelectedServingIdx(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {food.servings?.map((s, idx) => (
                <option key={idx} value={idx}>
                  {s.servingSize} {s.servingUnit} ({s.weightGrams}g)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Quantity
            </label>
            <input
              type="number"
              step="0.25"
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Meal Section
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snacks</option>
            </select>
          </div>
        </div>

        {/* Nutrition Facts Label */}
        <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900 space-y-3">
          <div className="border-b-4 border-slate-900 dark:border-slate-100 pb-2">
            <h3 className="text-xl font-black uppercase tracking-tight">Nutrition Facts</h3>
            <p className="text-xs text-slate-500">
              Per {quantity} × {serving.servingSize} {serving.servingUnit} ({Math.round(serving.weightGrams * quantity)}g)
            </p>
          </div>

          <div className="flex items-baseline justify-between border-b-2 border-slate-900 dark:border-slate-100 py-2">
            <span className="text-sm font-bold">Calories</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {currentNutrition.calories}
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            <div className="flex justify-between py-1.5 font-bold">
              <span>Total Fat</span>
              <span>{currentNutrition.fat}g</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold">
              <span>Total Carbohydrate</span>
              <span>{currentNutrition.carbs}g</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-slate-500">
              <span>Dietary Fiber</span>
              <span>{currentNutrition.fiber}g</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-slate-500">
              <span>Total Sugars</span>
              <span>{currentNutrition.sugar}g</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold">
              <span>Protein</span>
              <span>{currentNutrition.protein}g</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold">
              <span>Sodium</span>
              <span>{currentNutrition.sodium}mg</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleLog}
          isLoading={logMutation.isPending}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Add to {mealType.toUpperCase()} ({selectedDate})
        </Button>
      </Card>
    </div>
  );
};

export default FoodDetailPage;
