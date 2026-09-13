import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Star, History, Sparkles, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { useUIStore } from '../../store/useUIStore';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';
import { FOOD_CATEGORIES } from '../../constants/config';

export const FoodSearchModal = () => {
  const queryClient = useQueryClient();
  const activeModal = useUIStore((state) => state.activeModal);
  const modalData = useUIStore((state) => state.modalData);
  const closeModal = useUIStore((state) => state.closeModal);
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const isOpen = activeModal === 'foodSearch';
  const defaultMeal = modalData?.initialMealType || 'breakfast';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'recent' | 'favorites'
  const [selectedMealType, setSelectedMealType] = useState(defaultMeal);

  // Selected food for logging
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedServingIdx, setSelectedServingIdx] = useState(0);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch search results
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
    queryKey: ['foods', debouncedQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      return api.get(`/foods?${params.toString()}`);
    },
    enabled: isOpen && activeTab === 'search',
  });

  // Fetch recent foods
  const { data: recentData, isLoading: isRecentLoading } = useQuery({
    queryKey: ['recentFoods'],
    queryFn: () => api.get('/foods/user/recent'),
    enabled: isOpen && activeTab === 'recent',
  });

  // Fetch favorite foods
  const { data: favoritesData, isLoading: isFavLoading } = useQuery({
    queryKey: ['favoriteFoods'],
    queryFn: () => api.get('/foods/user/favorites'),
    enabled: isOpen && activeTab === 'favorites',
  });

  // Log food mutation
  const logMutation = useMutation({
    mutationFn: (itemPayload) => api.post('/diary/items', itemPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recentFoods'] });
      addToast(`Added ${selectedFood.name} to ${selectedMealType}!`, 'success');
      handleClose();
    },
    onError: (err) => {
      addToast(err.message || 'Failed to log food', 'error');
    },
  });

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSelectedServingIdx(food.defaultServingIndex || 0);
    setQuantity(1);
  };

  const handleConfirmLog = () => {
    if (!selectedFood) return;

    const serving = selectedFood.servings?.[selectedServingIdx] || {
      servingSize: 1,
      servingUnit: 'serving',
      weightGrams: 100,
    };

    const ratio = (serving.weightGrams / 100) * quantity;
    const baseNut = selectedFood.nutritionPer100g;

    const itemPayload = {
      date: selectedDate,
      mealType: selectedMealType,
      foodId: selectedFood._id,
      foodName: selectedFood.name,
      brand: selectedFood.brand,
      servingSize: serving.servingSize,
      servingUnit: serving.servingUnit,
      servingWeightGrams: serving.weightGrams,
      quantity: Number(quantity),
      calories: Math.round(baseNut.calories * ratio),
      protein: parseFloat((baseNut.protein * ratio).toFixed(1)),
      carbs: parseFloat((baseNut.carbs * ratio).toFixed(1)),
      fat: parseFloat((baseNut.fat * ratio).toFixed(1)),
      fiber: parseFloat(((baseNut.fiber || 0) * ratio).toFixed(1)),
      sugar: parseFloat(((baseNut.sugar || 0) * ratio).toFixed(1)),
      sodium: Math.round((baseNut.sodium || 0) * ratio),
    };

    logMutation.mutate(itemPayload);
  };

  const handleClose = () => {
    setSelectedFood(null);
    setSearchQuery('');
    closeModal();
  };

  const currentFoodsList =
    activeTab === 'search'
      ? searchData?.data?.foods || []
      : activeTab === 'recent'
      ? recentData?.data?.foods || []
      : favoritesData?.data?.foods || [];

  const isLoading =
    activeTab === 'search' ? isSearchLoading : activeTab === 'recent' ? isRecentLoading : isFavLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={selectedFood ? 'Log Food Item' : 'Add Food to Diary'}
      subtitle={selectedFood ? 'Adjust portion & meal' : `Logging for ${selectedDate}`}
      maxWidth="max-w-xl"
    >
      {selectedFood ? (
        /* Portion & Logging Step */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{selectedFood.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedFood.brand} • {selectedFood.category}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Meal Category
              </label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snacks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Serving Size
              </label>
              <select
                value={selectedServingIdx}
                onChange={(e) => setSelectedServingIdx(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
              >
                {selectedFood.servings?.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.servingSize} {s.servingUnit} ({s.weightGrams}g)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Number of Servings
            </label>
            <input
              type="number"
              step="0.25"
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Computed Macro Preview */}
          {(() => {
            const serving = selectedFood.servings?.[selectedServingIdx] || { weightGrams: 100 };
            const ratio = (serving.weightGrams / 100) * quantity;
            const base = selectedFood.nutritionPer100g;
            const cal = Math.round(base.calories * ratio);
            const pro = parseFloat((base.protein * ratio).toFixed(1));
            const carb = parseFloat((base.carbs * ratio).toFixed(1));
            const fat = parseFloat((base.fat * ratio).toFixed(1));

            return (
              <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Calories</span>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{cal}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Carbs</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{carb}g</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Protein</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{pro}g</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Fat</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{fat}g</p>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setSelectedFood(null)}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmLog}
              isLoading={logMutation.isPending}
            >
              Add to Diary
            </Button>
          </div>
        </div>
      ) : (
        /* Food Search List Step */
        <div className="space-y-3">
          {/* Tabs: Search | Recent | Favorites */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'search'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Search Database
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'recent'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Recent
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" /> Favorites
            </button>
          </div>

          {activeTab === 'search' && (
            <div className="space-y-2">
              <Input
                placeholder="Search food by name or brand (e.g. Oats, Chicken, Salmon)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                autoFocus
              />

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {FOOD_CATEGORIES.slice(0, 7).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="min-h-[220px] max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
            {isLoading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : currentFoodsList.length > 0 ? (
              currentFoodsList.map((food) => (
                <div
                  key={food._id}
                  onClick={() => handleSelectFood(food)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all group"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {food.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {food.brand} • {food.servings?.[0]?.servingSize} {food.servings?.[0]?.servingUnit} ({food.servings?.[0]?.weightGrams}g)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      {food.nutritionPer100g?.calories} kcal
                    </span>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500 group-hover:text-white transition-colors"
                      aria-label="Select food"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <p className="text-sm">No food items found matching your query.</p>
                <p className="text-xs text-slate-400 mt-1">Try a different keyword or category.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FoodSearchModal;
