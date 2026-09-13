import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Plus, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const ExercisePage = () => {
  const queryClient = useQueryClient();
  const selectedDate = useUIStore((state) => state.selectedDate);
  const openModal = useUIStore((state) => state.openModal);
  const addToast = useUIStore((state) => state.addToast);

  const { data: exerciseRes, isLoading } = useQuery({
    queryKey: ['exercises', selectedDate],
    queryFn: () => api.get(`/exercises?date=${selectedDate}`),
  });

  const logs = exerciseRes?.data?.logs || [];
  const summary = exerciseRes?.data?.summary || { totalCaloriesBurned: 0, totalMinutes: 0, count: 0 };

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/exercises/log/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Exercise log removed', 'info');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exercise & Activity"
        subtitle={`Track your cardio, strength workouts, and active calories for ${selectedDate}`}
        actions={
          <Button
            variant="primary"
            onClick={() => openModal('logExercise')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Activity
          </Button>
        }
      />

      {/* Summary Vitals Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Calories Burned</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.totalCaloriesBurned} <span className="text-xs font-normal">kcal</span>
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Active Time</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.totalMinutes} <span className="text-xs font-normal">minutes</span>
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Activities</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.count} <span className="text-xs font-normal">logged</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Activity History Logs */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Logged Activities for {selectedDate}
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : logs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <div key={log._id} className="py-3.5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {log.exerciseName}
                    </span>
                    <Badge variant="amber" size="sm">
                      {log.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{log.durationMinutes} min</span>
                    {log.distanceKm > 0 && <span>• {log.distanceKm} km</span>}
                    {log.notes && <span>• {log.notes}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-amber-500">
                    -{log.caloriesBurned} kcal
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(log._id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                    aria-label="Remove exercise entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <Flame className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm">No exercises logged for {selectedDate}.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal('logExercise')}
            >
              Log an activity now
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExercisePage;
