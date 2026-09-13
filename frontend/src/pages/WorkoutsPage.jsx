import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Dumbbell, Trash2, CheckCircle2, Clock, X } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const WorkoutsPage = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [unsavedWarningOpen, setUnsavedWarningOpen] = useState(false);

  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(45);
  const [exercises, setExercises] = useState([
    { name: 'Barbell Bench Press', sets: [{ setNumber: 1, reps: 10, weightKg: 60, completed: true }] },
  ]);

  const { data: workoutsRes, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => api.get('/workouts'),
  });

  const workouts = workoutsRes?.data?.workouts || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/workouts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      addToast('Workout routine removed', 'info');
      setConfirmDeleteOpen(false);
      setWorkoutToDelete(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/workouts', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      addToast('New workout routine created!', 'success');
      resetForm();
      setCreateModalOpen(false);
    },
  });

  const resetForm = () => {
    setWorkoutName('');
    setDescription('');
    setDuration(45);
    setExercises([
      { name: 'Barbell Bench Press', sets: [{ setNumber: 1, reps: 10, weightKg: 60, completed: true }] },
    ]);
  };

  const handleCloseModal = () => {
    const isDirty = workoutName.trim().length > 0 || description.trim().length > 0 || exercises.some((e) => e.name.trim().length > 0);
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

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { name: '', sets: [{ setNumber: 1, reps: 10, weightKg: 20, completed: true }] },
    ]);
  };

  const handleRemoveExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleExerciseNameChange = (idx, value) => {
    const updated = [...exercises];
    updated[idx].name = value;
    setExercises(updated);
  };

  const handleSetChange = (exIdx, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = Number(value) || 0;
    setExercises(updated);
  };

  const handleAddSet = (exIdx) => {
    const updated = [...exercises];
    const currentSets = updated[exIdx].sets;
    const lastSet = currentSets[currentSets.length - 1] || { reps: 10, weightKg: 20 };
    currentSets.push({
      setNumber: currentSets.length + 1,
      reps: lastSet.reps,
      weightKg: lastSet.weightKg,
      completed: true,
    });
    setExercises(updated);
  };

  const handleCreateWorkout = (e) => {
    e.preventDefault();
    if (!workoutName.trim()) return;

    createMutation.mutate({
      name: workoutName.trim(),
      description: description.trim(),
      estimatedDurationMinutes: Number(duration) || 45,
      exercises: exercises.map((ex) => ({
        name: ex.name.trim() || 'Exercise',
        category: 'strength',
        sets: ex.sets.map((s, sIdx) => ({
          setNumber: sIdx + 1,
          reps: Number(s.reps) || 10,
          weightKg: Number(s.weightKg) || 0,
          completed: true,
        })),
      })),
    });
  };

  const promptDeleteWorkout = (workout) => {
    setWorkoutToDelete(workout);
    setConfirmDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Routines"
        subtitle="Structure your progressive resistance training, sets, reps, and weights"
        actions={
          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Routine
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-44 animate-pulse" />
          <Card className="h-44 animate-pulse" />
        </div>
      ) : workouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((w) => (
            <Card key={w._id} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{w.name}</h3>
                    {w.description && <p className="text-xs text-slate-500">{w.description}</p>}
                  </div>
                </div>

                <button
                  onClick={() => promptDeleteWorkout(w)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                  aria-label="Delete workout"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> ~{w.estimatedDurationMinutes || 45} mins
                </span>
                <span>{w.exercises?.length || 0} exercises</span>
              </div>

              {/* Exercises List preview */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {w.exercises?.map((ex, idx) => (
                  <div key={idx} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{ex.name}</span>
                      <span className="text-slate-400">
                        {ex.sets?.length} sets • best set: {ex.sets?.[ex.sets.length - 1]?.weightKg}kg × {ex.sets?.[ex.sets.length - 1]?.reps} reps
                      </span>
                    </div>
                    <span className="text-emerald-500 text-[11px] font-bold">Configured</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-500 space-y-3">
          <Dumbbell className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No workout routines yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Design structured routines with exercise sets, target reps, and weights.
          </p>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            Build Routine
          </Button>
        </Card>
      )}

      {/* Create Workout Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={handleCloseModal}
        title="Create Workout Routine"
        subtitle="Build your custom resistance training split"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateWorkout} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <Input
            label="Workout Routine Name"
            required
            placeholder="e.g. Chest & Triceps Hypertrophy"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Progressive overload on compound barbell lifts"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Estimated Duration (minutes)"
            type="number"
            min="10"
            max="180"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />

          {/* Dynamic Exercises Section */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exercises ({exercises.length})
              </label>
              <button
                type="button"
                onClick={handleAddExercise}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Exercise
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((ex, exIdx) => (
                <div key={exIdx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g. Incline Dumbbell Press)"
                      required
                      value={ex.name}
                      onChange={(e) => handleExerciseNameChange(exIdx, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
                    />
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                        aria-label="Remove exercise"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Sets */}
                  <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/30">
                    <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Set</span>
                      <span>Weight (kg)</span>
                      <span>Target Reps</span>
                    </div>

                    {ex.sets.map((s, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-3 gap-2 items-center text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Set {sIdx + 1}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={s.weightKg}
                          onChange={(e) => handleSetChange(exIdx, sIdx, 'weightKg', e.target.value)}
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                        <input
                          type="number"
                          min="1"
                          value={s.reps}
                          onChange={(e) => handleSetChange(exIdx, sIdx, 'reps', e.target.value)}
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline pt-1 block"
                    >
                      + Add Set
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createMutation.isPending}>
              Create Routine
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(workoutToDelete?._id)}
        title="Delete this workout routine?"
        message={`Are you sure you want to delete "${workoutToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Routine"
        isLoading={deleteMutation.isPending}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmModal
        isOpen={unsavedWarningOpen}
        onClose={() => setUnsavedWarningOpen(false)}
        onConfirm={confirmDiscardUnsaved}
        title="Discard unsaved routine?"
        message="You have unsaved changes in your workout routine builder. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        isDestructive={true}
      />
    </div>
  );
};

export default WorkoutsPage;

