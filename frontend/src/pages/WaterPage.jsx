import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Droplets, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { DateNavigator } from '../components/common/DateNavigator';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const WaterPage = () => {
  const queryClient = useQueryClient();
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const [customMl, setCustomMl] = useState(250);

  const { data: waterRes, isLoading } = useQuery({
    queryKey: ['water', selectedDate],
    queryFn: () => api.get(`/water?date=${selectedDate}`),
  });

  const water = waterRes?.data || { totalMl: 0, targetMl: 2500, percentage: 0, logs: [] };

  const addWaterMutation = useMutation({
    mutationFn: (amountMl) => api.post('/water', { date: selectedDate, amountMl }),
    onSuccess: (_, amountMl) => {
      queryClient.invalidateQueries({ queryKey: ['water', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', selectedDate] });
      addToast(`+${amountMl} ml of water recorded!`, 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/water/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', selectedDate] });
      addToast('Water log removed', 'info');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Hydration Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Log daily fluid intake to fuel recovery and cognitive focus
          </p>
        </div>
        <DateNavigator />
      </div>

      {/* Main Hydration Progress Card */}
      <Card className="p-6 sm:p-8 space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center shadow-inner">
          <Droplets className="w-10 h-10" />
        </div>

        <div>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-cyan-600 dark:text-cyan-400">
              {water.totalMl}
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-400">
              / {water.targetMl} ml
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {water.percentage}% of daily hydration target reached
          </p>
        </div>

        {/* Large Progress Bar */}
        <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden max-w-lg mx-auto shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, water.percentage)}%` }}
          />
        </div>

        {/* Mobile-Friendly Quick-Add Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto pt-2">
          {[250, 500, 750, 1000].map((amt) => (
            <button
              key={amt}
              onClick={() => addWaterMutation.mutate(amt)}
              disabled={addWaterMutation.isPending}
              className="py-3 px-2 rounded-xl border border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-extrabold text-sm transition-all active:scale-95 shadow-xs"
            >
              +{amt} ml
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto pt-2">
          <input
            type="number"
            step="50"
            min="50"
            value={customMl}
            onChange={(e) => setCustomMl(parseInt(e.target.value, 10) || 0)}
            className="w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-center font-bold"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => addWaterMutation.mutate(customMl)}
            isLoading={addWaterMutation.isPending}
          >
            Add Custom
          </Button>
        </div>
      </Card>

      {/* Daily Logs Timeline */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          Hydration Log Timeline ({selectedDate})
        </h3>

        {water.logs && water.logs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {water.logs.map((log) => (
              <div key={log._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-500 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      +{log.amountMl} ml
                    </span>
                    <span className="text-xs text-slate-400 block">
                      {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteMutation.mutate(log._id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                  aria-label="Delete water log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            No water logged yet for {selectedDate}. Tap any quick-add button above to start.
          </p>
        )}
      </Card>
    </div>
  );
};

export default WaterPage;
