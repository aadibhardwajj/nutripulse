import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, Users, Plus, Utensils, Check } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const { data: recipeRes, isLoading } = useQuery({
    queryKey: ['recipeDetail', id],
    queryFn: () => api.get(`/recipes/${id}`),
  });

  const recipe = recipeRes?.data?.recipe;

  const logRecipeMutation = useMutation({
    mutationFn: () =>
      api.post(`/recipes/${id}/log`, {
        date: selectedDate,
        mealType: 'dinner',
        servingsLogged: 1,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast(`Logged 1 serving of ${recipe.name} to diary!`, 'success');
      navigate('/diary');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card className="p-8 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-3">
        <p className="font-bold">Recipe not found.</p>
        <Link to="/recipes">
          <Button variant="outline" size="sm">
            Back to Recipes
          </Button>
        </Link>
      </div>
    );
  }

  const per = recipe.perServingNutrition || {};
  const total = recipe.totalNutrition || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/recipes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Recipes
      </Link>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {recipe.name}
          </h1>
          {recipe.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{recipe.description}</p>
          )}

          <div className="flex items-center gap-5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" /> {recipe.servings} Servings
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> {recipe.prepTimeMinutes}m prep + {recipe.cookTimeMinutes}m cook
            </span>
          </div>
        </div>

        {/* Nutrition Per Serving Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nutrition Per Serving (1 / {recipe.servings})
            </h3>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {per.calories} kcal
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Carbs</span>
              <span className="font-bold text-cyan-600">{per.carbs}g</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Protein</span>
              <span className="font-bold text-emerald-600">{per.protein}g</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fat</span>
              <span className="font-bold text-amber-600">{per.fat}g</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Sodium</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{per.sodium}mg</span>
            </div>
          </div>
        </div>

        {/* Ingredients List */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Ingredients</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {recipe.ingredients?.map((ing, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ing.name}</span>
                <span className="text-slate-500 font-medium">
                  {ing.quantity} × {ing.servingSize} {ing.servingUnit} ({ing.servingWeightGrams}g)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Instructions</h3>
            <div className="space-y-2">
              {recipe.instructions.map((inst) => (
                <div key={inst.step} className="flex items-start gap-3 text-xs leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                    {inst.step}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 pt-0.5">{inst.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log to diary button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => logRecipeMutation.mutate()}
          isLoading={logRecipeMutation.isPending}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Log 1 Serving to Today's Diary ({selectedDate})
        </Button>
      </Card>
    </div>
  );
};

export default RecipeDetailPage;
