import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sun, SunMedium, Moon, Apple, Plus, ArrowRight } from 'lucide-react';
import { DateNavigator } from '../components/common/DateNavigator';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MealSection } from '../components/nutrition/MealSection';
import { SkeletonDiaryRow } from '../components/common/Skeleton';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const DiaryPage = () => {
  const queryClient = useQueryClient();
  const selectedDate = useUIStore((state) => state.selectedDate);
  const openModal = useUIStore((state) => state.openModal);
  const addToast = useUIStore((state) => state.addToast);

  const { data: diaryRes, isLoading } = useQuery({
    queryKey: ['diary', selectedDate],
    queryFn: () => api.get(`/diary?date=${selectedDate}`),
  });

  const diary = diaryRes?.data;
  const meals = diary?.meals || { breakfast: [], lunch: [], dinner: [], snack: [] };
  const totalsByMeal = diary?.totalsByMeal || {};
  const dailyTotal = diary?.dailyTotal || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goalCalories = diary?.goalCalories || 2000;

  // Delete Item Mutation
  const deleteMutation = useMutation({
    mutationFn: (itemId) => api.delete(`/diary/items/${itemId}?date=${selectedDate}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', selectedDate] });
      addToast('Item removed from diary', 'info');
    },
  });

  // Duplicate Item Mutation
  const duplicateMutation = useMutation({
    mutationFn: (itemId) =>
      api.post(`/diary/items/${itemId}/duplicate`, { sourceDate: selectedDate, targetDate: selectedDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', selectedDate] });
      addToast('Item duplicated successfully', 'success');
    },
  });

  const handleAddFood = (mealType) => {
    openModal('foodSearch', { initialMealType: mealType });
  };

  const mealConfigs = [
    { key: 'breakfast', title: 'Breakfast', icon: Sun },
    { key: 'lunch', title: 'Lunch', icon: SunMedium },
    { key: 'dinner', title: 'Dinner', icon: Moon },
    { key: 'snack', title: 'Snacks', icon: Apple },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Food Diary
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Detailed log for all meals and daily nutrition totals
          </p>
        </div>
        <DateNavigator />
      </div>

      {/* Daily Totals Banner Card */}
      <Card className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-0 shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center">
          <div className="col-span-2 sm:col-span-1 border-b sm:border-b-0 sm:border-r border-white/20 pb-2 sm:pb-0">
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Total Consumed</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black">{dailyTotal.calories}</span>
              <span className="text-xs text-emerald-200 font-bold">/ {goalCalories} kcal</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-bold text-emerald-200 uppercase">Carbohydrates</span>
            <p className="text-xl font-black mt-0.5">{dailyTotal.carbs}g</p>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-bold text-emerald-200 uppercase">Protein</span>
            <p className="text-xl font-black mt-0.5">{dailyTotal.protein}g</p>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-bold text-emerald-200 uppercase">Fat</span>
            <p className="text-xl font-black mt-0.5">{dailyTotal.fat}g</p>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-bold text-emerald-200 uppercase">Sodium</span>
            <p className="text-xl font-black mt-0.5">{dailyTotal.sodium || 0}mg</p>
          </div>
        </div>
      </Card>

      {/* Meal Sections */}
      {isLoading ? (
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <SkeletonDiaryRow />
            <SkeletonDiaryRow />
          </Card>
          <Card className="p-4 space-y-3">
            <SkeletonDiaryRow />
            <SkeletonDiaryRow />
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {mealConfigs.map((cfg) => (
            <MealSection
              key={cfg.key}
              mealType={cfg.key}
              title={cfg.title}
              icon={cfg.icon}
              items={meals[cfg.key] || []}
              totals={totalsByMeal[cfg.key]}
              onAddFood={handleAddFood}
              onDeleteItem={(id) => deleteMutation.mutate(id)}
              onDuplicateItem={(id) => duplicateMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiaryPage;
