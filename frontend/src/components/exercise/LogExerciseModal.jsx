import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useUIStore } from '../../store/useUIStore';
import api from '../../services/api';

export const LogExerciseModal = () => {
  const queryClient = useQueryClient();
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const isOpen = activeModal === 'logExercise';

  const [exerciseName, setExerciseName] = useState('Running / Jogging (8 km/h)');
  const [category, setCategory] = useState('running');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [distanceKm, setDistanceKm] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // Fetch catalog
  const { data: catalogData } = useQuery({
    queryKey: ['exerciseCatalog'],
    queryFn: () => api.get('/exercises/catalog'),
    enabled: isOpen,
  });

  const catalog = catalogData?.data?.exercises || [];

  const exerciseMutation = useMutation({
    mutationFn: (payload) => api.post('/exercises/log', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Exercise session recorded!', 'success');
      closeModal();
    },
    onError: (err) => {
      addToast(err.message || 'Failed to log exercise', 'error');
    },
  });

  const handleSelectCatalog = (e) => {
    const selected = catalog.find((item) => item.name === e.target.value);
    if (selected) {
      setExerciseName(selected.name);
      setCategory(selected.category);
    } else {
      setExerciseName(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    exerciseMutation.mutate({
      date: selectedDate,
      exerciseName,
      category,
      durationMinutes: Number(durationMinutes),
      distanceKm: Number(distanceKm) || 0,
      caloriesBurned: Number(caloriesBurned) || 0, // 0 triggers MET backend calculation
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Log Physical Activity"
      subtitle={`Logging for ${selectedDate}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
            Activity / Exercise
          </label>
          <select
            value={exerciseName}
            onChange={handleSelectCatalog}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 mb-2"
          >
            {catalog.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
            <option value="Custom Activity">Custom Activity...</option>
          </select>

          {exerciseName === 'Custom Activity' && (
            <Input
              placeholder="Enter activity name"
              onChange={(e) => setExerciseName(e.target.value)}
              className="mt-1"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="600"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Distance (km, optional)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
            Calories Burned (leave 0 for auto-estimate)
          </label>
          <input
            type="number"
            min="0"
            value={caloriesBurned}
            onChange={(e) => setCaloriesBurned(e.target.value)}
            placeholder="Auto-calculated from MET"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Leaving this at 0 uses metabolic equivalent (MET) multiplied by your weight.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={exerciseMutation.isPending}
            leftIcon={<Flame className="w-4 h-4" />}
          >
            Save Exercise
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogExerciseModal;
