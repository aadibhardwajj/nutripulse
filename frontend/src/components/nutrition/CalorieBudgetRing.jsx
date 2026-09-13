import React from 'react';
import { Flame, Utensils, Flag } from 'lucide-react';
import { Card } from '../common/Card';

export const CalorieBudgetRing = ({
  target = 2000,
  consumed = 0,
  burned = 0,
  remaining = 2000,
}) => {
  // Compute percentage clamped between 0 and 100
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <Card className="flex flex-col items-center text-center relative overflow-hidden">
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Daily Energy Balance
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          {pct}% Target
        </span>
      </div>

      {/* Circular Progress Gauge */}
      <div className="relative my-6 flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Active progress arc */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="url(#emeraldGradient)"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Numbers */}
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {remaining}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Kcal Remaining
          </span>
        </div>
      </div>

      {/* Equation Breakdown: Target - Food + Exercise */}
      <div className="grid grid-cols-3 w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-center gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-semibold">
            <Flag className="w-3.5 h-3.5 text-slate-400" />
            <span>Goal</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{target}</p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-semibold">
            <Utensils className="w-3.5 h-3.5 text-emerald-500" />
            <span>Food</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{consumed}</p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Exercise</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{burned}</p>
        </div>
      </div>
    </Card>
  );
};

export default CalorieBudgetRing;
