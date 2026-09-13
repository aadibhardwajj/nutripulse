import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, ChefHat, Clock, Users, ArrowRight, Trash2, X } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const RecipesPage = () => {
  const queryClient = useQueryClient();
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [unsavedWarningOpen, setUnsavedWarningOpen] = useState(false);

  // Recipe form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(2);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [cookTimeMinutes, setCookTimeMinutes] = useState(20);
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: 1, servingUnit: 'serving', calories: 150, protein: 10, carbs: 15, fat: 5 },
  ]);

  const { data: recipesRes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => api.get('/recipes'),
  });

  const recipes = recipesRes?.data?.recipes || [];

  // Log recipe mutation
  const logRecipeMutation = useMutation({
    mutationFn: (recipeId) =>
      api.post(`/recipes/${recipeId}/log`, {
        date: selectedDate,
        mealType: 'dinner',
        servingsLogged: 1,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast(`Logged 1 serving of ${res.data.recipeName} to diary!`, 'success');
    },
  });

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation({
    mutationFn: (recipeId) => api.delete(`/recipes/${recipeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      addToast('Recipe deleted', 'info');
      setConfirmDeleteOpen(false);
      setRecipeToDelete(null);
    },
  });

  // Create recipe mutation
  const createRecipeMutation = useMutation({
    mutationFn: (payload) => api.post('/recipes', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      addToast('New recipe created with auto-calculated macros!', 'success');
      resetForm();
      setCreateModalOpen(false);
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setServings(2);
    setPrepTimeMinutes(15);
    setCookTimeMinutes(20);
    setIngredients([
      { name: '', quantity: 1, servingUnit: 'serving', calories: 150, protein: 10, carbs: 15, fat: 5 },
    ]);
  };

  const handleCloseCreateModal = () => {
    const isDirty = name.trim().length > 0 || description.trim().length > 0 || ingredients.some((i) => i.name.trim().length > 0);
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

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: 1, servingUnit: 'serving', calories: 100, protein: 5, carbs: 10, fat: 2 },
    ]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = field === 'name' || field === 'servingUnit' ? value : Number(value) || 0;
    setIngredients(updated);
  };

  const handleCreateRecipe = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createRecipeMutation.mutate({
      name,
      description,
      servings: Number(servings),
      prepTimeMinutes: Number(prepTimeMinutes),
      cookTimeMinutes: Number(cookTimeMinutes),
      ingredients: ingredients.map((ing) => ({
        name: ing.name.trim() || 'Ingredient',
        quantity: Number(ing.quantity) || 1,
        servingSize: 1,
        servingUnit: ing.servingUnit || 'serving',
        servingWeightGrams: 100,
        nutrition: {
          calories: Number(ing.calories) || 0,
          protein: Number(ing.protein) || 0,
          carbs: Number(ing.carbs) || 0,
          fat: Number(ing.fat) || 0,
        },
      })),
      instructions: [],
    });
  };

  const promptDeleteRecipe = (recipe) => {
    setRecipeToDelete(recipe);
    setConfirmDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recipe Builder"
        subtitle="Build custom multi-ingredient recipes with automated total and per-serving nutrition"
        actions={
          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Recipe
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-44 animate-pulse" />
          <Card className="h-44 animate-pulse" />
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((r) => {
            const per = r.perServingNutrition || {};
            return (
              <Card key={r._id} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                        <ChefHat className="w-4 h-4" />
                      </div>
                      <Link
                        to={`/recipes/${r._id}`}
                        className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-emerald-600 transition-colors"
                      >
                        {r.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => promptDeleteRecipe(r)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      aria-label="Delete recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {r.description && <p className="text-xs text-slate-500 line-clamp-1">{r.description}</p>}

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {r.servings} servings
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {(r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0)} min total
                    </span>
                  </div>
                </div>

                {/* Per Serving Nutrition Box */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {per.calories} kcal / serving
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {r.ingredients?.length || 0} ingredients
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-center text-xs">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">C: {per.carbs}g</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">P: {per.protein}g</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">F: {per.fat}g</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/recipes/${r._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Recipe
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => logRecipeMutation.mutate(r._id)}
                    isLoading={logRecipeMutation.isPending}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Log 1 Serving
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-500 space-y-3">
          <ChefHat className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No custom recipes yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Build your own home recipes with multi-ingredient totals and per-serving macro splits.
          </p>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            Build First Recipe
          </Button>
        </Card>
      )}

      {/* Create Recipe Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={handleCloseCreateModal}
        title="Create Recipe"
        subtitle="Combine ingredients with live nutrition calculations"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateRecipe} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <Input
            label="Recipe Name"
            required
            placeholder="e.g. High-Protein Salmon Power Bowl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Description"
            placeholder="e.g. Pan-seared salmon with brown rice and fresh herbs"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Servings"
              type="number"
              min="1"
              max="20"
              required
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
            <Input
              label="Prep (min)"
              type="number"
              min="1"
              value={prepTimeMinutes}
              onChange={(e) => setPrepTimeMinutes(e.target.value)}
            />
            <Input
              label="Cook (min)"
              type="number"
              min="1"
              value={cookTimeMinutes}
              onChange={(e) => setCookTimeMinutes(e.target.value)}
            />
          </div>

          {/* Dynamic Ingredients Section */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ingredients ({ingredients.length})
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Ingredient
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ingredient Name (e.g. Chicken Breast)"
                      required
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                        aria-label="Remove ingredient"
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
                        value={ing.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Calories (kcal)</span>
                      <input
                        type="number"
                        min="0"
                        value={ing.calories}
                        onChange={(e) => handleIngredientChange(index, 'calories', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Protein (g)</span>
                      <input
                        type="number"
                        min="0"
                        value={ing.protein}
                        onChange={(e) => handleIngredientChange(index, 'protein', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Carbs (g)</span>
                      <input
                        type="number"
                        min="0"
                        value={ing.carbs}
                        onChange={(e) => handleIngredientChange(index, 'carbs', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={handleCloseCreateModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createRecipeMutation.isPending}>
              Create Recipe
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => deleteRecipeMutation.mutate(recipeToDelete?._id)}
        title="Delete this recipe?"
        message={`Are you sure you want to delete "${recipeToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Recipe"
        isLoading={deleteRecipeMutation.isPending}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmModal
        isOpen={unsavedWarningOpen}
        onClose={() => setUnsavedWarningOpen(false)}
        onConfirm={confirmDiscardUnsaved}
        title="Discard unsaved recipe?"
        message="You have unsaved changes in your recipe builder. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        isDestructive={true}
      />
    </div>
  );
};

export default RecipesPage;

