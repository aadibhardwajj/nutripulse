import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Apple,
  Droplets,
  Flame,
  Scale,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { DateNavigator } from '../components/common/DateNavigator';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SkeletonCard } from '../components/common/Skeleton';
import { CalorieBudgetRing } from '../components/nutrition/CalorieBudgetRing';
import { MacroBar } from '../components/nutrition/MacroBar';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const DashboardPage = () => {
  const selectedDate = useUIStore((state) => state.selectedDate);
  const openModal = useUIStore((state) => state.openModal);

  const { data: dashboardRes, isLoading } = useQuery({
    queryKey: ['dashboard', selectedDate],
    queryFn: () => api.get(`/dashboard?date=${selectedDate}`),
  });

  const d = dashboardRes?.data;

  return (
    <div className="space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Daily Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Your live energy budget and health vitals
          </p>
        </div>
        <DateNavigator />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => openModal('foodSearch')}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 shadow-subtle transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">+ Add Food</span>
            <span className="text-[11px] text-slate-400">Log to Diary</span>
          </div>
        </button>

        <button
          onClick={() => openModal('logWater')}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 shadow-subtle transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">+ Add Water</span>
            <span className="text-[11px] text-slate-400">Stay Hydrated</span>
          </div>
        </button>

        <button
          onClick={() => openModal('logExercise')}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 shadow-subtle transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">+ Log Exercise</span>
            <span className="text-[11px] text-slate-400">Burn Calories</span>
          </div>
        </button>

        <button
          onClick={() => openModal('logWeight')}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 shadow-subtle transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">+ Log Weight</span>
            <span className="text-[11px] text-slate-400">Update Scale</span>
          </div>
        </button>
      </div>

      {/* Main Budget & Macro Visuals */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CalorieBudgetRing
            target={d?.calories?.target}
            consumed={d?.calories?.consumed}
            burned={d?.calories?.burned}
            remaining={d?.calories?.remaining}
          />
          <MacroBar macros={d?.macros} />
        </div>
      )}

      {/* Hydration & Vitals Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Water widget */}
        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Water Intake</span>
            <p className="text-xl font-black text-cyan-600 dark:text-cyan-400">
              {d?.water?.consumedMl || 0} <span className="text-xs font-medium text-slate-400">/ {d?.water?.targetMl || 2500} ml</span>
            </p>
            <div className="w-32 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, d?.water?.percentage || 0)}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => openModal('logWater')}
            className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
            title="Add water"
          >
            <Plus className="w-5 h-5" />
          </button>
        </Card>

        {/* Exercise Burned */}
        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Exercise Burn</span>
            <p className="text-xl font-black text-amber-500">
              {d?.exercise?.caloriesBurned || 0} <span className="text-xs font-medium text-slate-400">kcal</span>
            </p>
            <p className="text-xs text-slate-500">
              {d?.exercise?.durationMinutes || 0} active minutes ({d?.exercise?.logsCount || 0} sessions)
            </p>
          </div>
          <Link
            to="/exercise"
            className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Card>

        {/* Weight Goal Progress */}
        <Card className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Weight Progress</span>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400">
              {d?.weight?.currentKg || '--'} <span className="text-xs font-medium text-slate-400">kg</span>
            </p>
            <p className="text-xs text-slate-500">
              Target: {d?.weight?.targetKg || '--'} kg ({d?.weight?.remainingKg || 0} kg to goal)
            </p>
          </div>
          <Link
            to="/weight"
            className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
          </Link>
        </Card>
      </div>

      {/* Diary Quick Snapshot */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Today's Meals Overview
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of logged meals for this date
            </p>
          </div>
          <Link to="/diary">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Full Diary
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'breakfast', label: 'Breakfast', icon: '☀️' },
            { key: 'lunch', label: 'Lunch', icon: '🥪' },
            { key: 'dinner', label: 'Dinner', icon: '🍲' },
            { key: 'snack', label: 'Snacks', icon: '🍎' },
          ].map((meal) => {
            const count = d?.mealItemCounts?.[meal.key] || 0;
            const mealCals = d?.totalsByMeal?.[meal.key]?.calories || 0;
            return (
              <div
                key={meal.key}
                onClick={() => openModal('foodSearch', { initialMealType: meal.key })}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500/40 cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {meal.icon} {meal.label}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{mealCals} kcal</p>
                <p className="text-[11px] text-slate-400">{count} {count === 1 ? 'item' : 'items'}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
