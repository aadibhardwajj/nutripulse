import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Star, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';
import { FOOD_CATEGORIES } from '../constants/config';

export const FoodsPage = () => {
  const queryClient = useQueryClient();
  const openModal = useUIStore((state) => state.openModal);
  const addToast = useUIStore((state) => state.addToast);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['foodsPage', debouncedSearch, category, sortBy, sortOrder, page],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: String(page),
        limit: '15',
        sortBy,
        sortOrder,
      });
      if (debouncedSearch) p.append('q', debouncedSearch);
      if (category && category !== 'All') p.append('category', category);
      return api.get(`/foods?${p.toString()}`);
    },
  });

  const foods = data?.data?.foods || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: (foodId) => api.post(`/foods/${foodId}/favorite`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['foodsPage'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteFoods'] });
      addToast(res.message || 'Updated favorites', 'success');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Food Database"
        subtitle="Search verified whole foods and brand products with detailed macronutrients"
      />

      {/* Search & Filters Card */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search foods by name or brand (e.g. Chicken, Oats, Salmon)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {FOOD_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="name">Sort: Name</option>
              <option value="calories">Sort: Calories</option>
              <option value="protein">Sort: Protein</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Food Grid / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      ) : foods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => {
            const defServing = food.servings?.[0] || { servingSize: 1, servingUnit: 'serving', weightGrams: 100 };
            const ratio = defServing.weightGrams / 100;
            const nut = food.nutritionPer100g;
            const cal = Math.round((nut?.calories || 0) * ratio);
            const pro = parseFloat(((nut?.protein || 0) * ratio).toFixed(1));
            const carb = parseFloat(((nut?.carbs || 0) * ratio).toFixed(1));
            const fat = parseFloat(((nut?.fat || 0) * ratio).toFixed(1));

            return (
              <Card key={food._id} className="p-5 flex flex-col justify-between hoverEffect space-y-3">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/foods/${food._id}`}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors line-clamp-1"
                    >
                      {food.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => favoriteMutation.mutate(food._id)}
                      className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        food.isFavorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                      aria-label="Bookmark food"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">{food.brand} • {food.category}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">{cal} kcal</span>
                    <span className="text-[11px] text-slate-400">
                      per {defServing.servingSize} {defServing.servingUnit} ({defServing.weightGrams}g)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-center text-xs">
                    <div className="text-cyan-600 dark:text-cyan-400">
                      <span className="text-[10px] text-slate-400 block">Carbs</span>
                      <span className="font-bold">{carb}g</span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400">
                      <span className="text-[10px] text-slate-400 block">Protein</span>
                      <span className="font-bold">{pro}g</span>
                    </div>
                    <div className="text-amber-600 dark:text-amber-400">
                      <span className="text-[10px] text-slate-400 block">Fat</span>
                      <span className="font-bold">{fat}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Link to={`/foods/${food._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Details
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openModal('foodSearch')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Log
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="app-card p-12 text-center text-slate-500">
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No foods found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or category filters.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <span className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodsPage;
