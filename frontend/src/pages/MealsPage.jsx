import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Utensils, ArrowRight, BookOpen, X } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const MealsPage = () => {
  const queryClient = useQueryClient();
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [unsavedWarningOpen, setUnsavedWarningOpen] = useState(false);

  const [mealName, setMealName] = useState('');
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [items, setItems] = useState([
    { foodName: '', quantity: 1, servingUnit: 'serving', calories: 200, protein: 15, carbs: 20, fat: 5 },
  ]);

  // Fetch meals
  const { data: mealsRes, isLoading } = useQuery({
    queryKey: ['meals'],
    queryFn: () => api.get('/meals'),
  });

  const meals = mealsRes?.data?.meals || [];

  // Log meal to diary
  const logMealMutation = useMutation({
    mutationFn: ({ mealId, date, targetMealType }) =>
      api.post(`/meals/${mealId}/log`, { date, mealType: targetMealType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('All meal items logged to diary!', 'success');
    },
  });

  // Delete meal
  const deleteMealMutation = useMutation({
    mutationFn: (mealId) => api.delete(`/meals/${mealId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      addToast('Meal removed', 'info');
      setConfirmDeleteOpen(false);
      setMealToDelete(null);
    },
  });

  // Create meal mutation
  const createMealMutation = useMutation({
    mutationFn: (payload) => api.post('/meals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      addToast('Saved reusable meal created!', 'success');
      resetForm();
      setCreateModalOpen(false);
    },
  });

  const resetForm = () => {
    setMealName('');
    setDescription('');
    setMealType('breakfast');
    setItems([
      { foodName: '', quantity: 1, servingUnit: 'serving', calories: 200, protein: 15, carbs: 20, fat: 5 },
    ]);
  };

  const handleCloseModal = () => {
    const isDirty = mealName.trim().length > 0 || description.trim().length > 0 || items.some((i) => i.foodName.trim().length > 0);
    if (isDirty) {
      setUnsavedWarningOpen(true);
    } else {
      setCreateModalOpen(false);
    }
  };

  const confirmDiscardUnsaved = () => {
    setUnsavedWarningOpen(false);
    resetForm();
    setCreateModalOpen(false);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { foodName: '', quantity: 1, servingUnit: 'serving', calories: 150, protein: 10, carbs: 15, fat: 4 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'foodName' || field === 'servingUnit' ? value : Number(value) || 0;
    setItems(updated);
  };

  const handleCreateMeal = (e) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    createMealMutation.mutate({
      name: mealName.trim(),
      description: description.trim(),
      defaultMealType: mealType,
      items: items.map((item) => ({
        foodId: '66e3f4e2427f7a1f5f241a01', // Fallback reference id
        foodName: item.foodName.trim() || 'Food Item',
        servingSize: 1,
        servingUnit: item.servingUnit || 'serving',
        servingWeightGrams: 100,
        quantity: Number(item.quantity) || 1,
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
      })),
    });
  };

  const promptDeleteMeal = (meal) => {
    setMealToDelete(meal);
    setConfirmDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Meals"
        subtitle="Group your favorite foods into reusable meal bundles and log them in one tap"
        actions={
          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Meal
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-36 animate-pulse" />
          <Card className="h-36 animate-pulse" />
        </div>
      ) : meals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map((m) => (
            <Card key={m._id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{m.name}</h3>
                  </div>
                  <button
                    onClick={() => promptDeleteMeal(m)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    aria-label="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {m.description && <p className="text-xs text-slate-500">{m.description}</p>}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {m.totalCalories} kcal
                  </span>
                  <p className="text-slate-500">
                    P: {m.totalProtein}g • C: {m.totalCarbs}g • F: {m.totalFat}g
                  </p>
                </div>
                <span className="text-slate-400 font-semibold">{m.items?.length || 0} items</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                onClick={() =>
                  logMealMutation.mutate({
                    mealId: m._id,
                    date: selectedDate,
                    targetMealType: m.defaultMealType,
                  })
                }
                leftIcon={<BookOpen className="w-4 h-4" />}
              >
                Log Meal to Today's Diary ({selectedDate})
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-500 space-y-3">
          <Utensils className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No saved meals yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Create reusable meal templates like "Power Breakfast" or "Post-Workout Lunch" to log in a single tap.
          </p>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            Create First Meal
          </Button>
        </Card>
      )}

      {/* Create Meal Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={handleCloseModal}
        title="Create Saved Meal"
        subtitle="Save a recurring meal bundle with custom foods"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateMeal} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <Input
            label="Meal Name"
            required
            placeholder="e.g. Daily Post-Gym Fuel"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Oatmeal bowl with vanilla protein and berries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Default Meal Slot
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Dynamic Items Section */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Meal Items ({items.length})
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Food Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Food Item Name"
                      required
                      value={item.foodName}
                      onChange={(e) => handleItemChange(index, 'foodName', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Qty</span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Calories (kcal)</span>
                      <input
                        type="number"
                        min="0"
                        value={item.calories}
                        onChange={(e) => handleItemChange(index, 'calories', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Protein (g)</span>
                      <input
                        type="number"
                        min="0"
                        value={item.protein}
                        onChange={(e) => handleItemChange(index, 'protein', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Carbs (g)</span>
                      <input
                        type="number"
                        min="0"
                        value={item.carbs}
                        onChange={(e) => handleItemChange(index, 'carbs', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createMealMutation.isPending}>
              Save Meal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => deleteMealMutation.mutate(mealToDelete?._id)}
        title="Delete this meal?"
        message={`Are you sure you want to delete "${mealToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Meal"
        isLoading={deleteMealMutation.isPending}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmModal
        isOpen={unsavedWarningOpen}
        onClose={() => setUnsavedWarningOpen(false)}
        onConfirm={confirmDiscardUnsaved}
        title="Discard unsaved meal?"
        message="You have unsaved changes in your meal builder. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        isDestructive={true}
      />
    </div>
  );
};

export default MealsPage;
