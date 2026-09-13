import React, { useState } from 'react';
import { Plus, MoreVertical, Trash2, Copy, Edit2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { ConfirmModal } from '../common/ConfirmModal';

export const MealSection = ({
  mealType,
  title,
  icon: Icon,
  items = [],
  totals = { calories: 0, protein: 0, carbs: 0, fat: 0 },
  onAddFood,
  onDeleteItem,
  onDuplicateItem,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  return (
    <Card className="overflow-hidden p-0" padding="p-0">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
            <p className="text-xs text-slate-500">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {/* Section Calories */}
        <div className="text-right">
          <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {totals.calories}
          </span>
          <span className="text-xs font-semibold text-slate-400 ml-1">kcal</span>
          <div className="text-[11px] text-slate-500 flex gap-2 justify-end">
            <span>C: {totals.carbs}g</span>
            <span>P: {totals.protein}g</span>
            <span>F: {totals.fat}g</span>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group relative"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {item.foodName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.quantity} × {item.servingSize} {item.servingUnit} ({item.servingWeightGrams}g)
                  {item.brand && ` • ${item.brand}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {item.calories} kcal
                  </span>
                  <p className="text-[10px] text-slate-400">
                    P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                  </p>
                </div>

                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Item actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === item._id && (
                    <div
                      className="absolute right-0 mt-1 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30"
                      onClick={() => setOpenMenuId(null)}
                    >
                      <button
                        onClick={() => onDuplicateItem && onDuplicateItem(item._id)}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 px-5 text-center text-slate-400 dark:text-slate-500 text-xs">
            No items logged for {title.toLowerCase()} yet.
          </div>
        )}
      </div>

      {/* Footer Add Food Button */}
      <div className="p-3 bg-slate-50/40 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 text-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 w-full justify-center"
          onClick={() => onAddFood(mealType)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Food to {title}
        </Button>
      </div>

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (onDeleteItem && itemToDelete) {
            onDeleteItem(itemToDelete._id);
          }
          setItemToDelete(null);
        }}
        title="Remove food item?"
        message={`Are you sure you want to remove "${itemToDelete?.foodName}" from ${title.toLowerCase()}?`}
        confirmText="Remove Item"
      />
    </Card>
  );
};

export default MealSection;
