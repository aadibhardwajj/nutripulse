import React from 'react';
import { Card } from '../common/Card';

export const MacroBar = ({ macros }) => {
  const carbs = macros?.carbs || { consumed: 0, target: 250, percentage: 0 };
  const protein = macros?.protein || { consumed: 0, target: 125, percentage: 0 };
  const fat = macros?.fat || { consumed: 0, target: 55, percentage: 0 };

  const items = [
    {
      label: 'Carbohydrates',
      consumed: carbs.consumed,
      target: carbs.target,
      pct: carbs.percentage,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Protein',
      consumed: protein.consumed,
      target: protein.target,
      pct: protein.percentage,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Fat',
      consumed: fat.consumed,
      target: fat.target,
      pct: fat.percentage,
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Macronutrient Distribution
        </h3>
        <span className="text-xs text-slate-400 font-medium">Consumed / Target</span>
      </div>

      <div className="space-y-3.5">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
              <span className="font-medium text-slate-500 dark:text-slate-400">
                <span className={`font-bold ${item.textColor}`}>{item.consumed}g</span> / {item.target}g
                <span className="text-slate-400 ml-1.5">({item.pct}%)</span>
              </span>
            </div>

            {/* Track & Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${Math.min(100, item.pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MacroBar;
