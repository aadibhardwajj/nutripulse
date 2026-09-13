import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Scale } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useUIStore } from '../../store/useUIStore';
import api from '../../services/api';

export const LogWeightModal = () => {
  const queryClient = useQueryClient();
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const isOpen = activeModal === 'logWeight';

  const [weightKg, setWeightKg] = useState(70.0);
  const [notes, setNotes] = useState('');

  const weightMutation = useMutation({
    mutationFn: (payload) => api.post('/weight', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      addToast('Weight record saved!', 'success');
      closeModal();
    },
    onError: (err) => {
      addToast(err.message || 'Failed to log weight', 'error');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    weightMutation.mutate({
      date: selectedDate,
      weightKg: Number(weightKg),
      notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Record Weight"
      subtitle={`Milestone entry for ${selectedDate}`}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-center">
        <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
          <Scale className="w-7 h-7" />
        </div>

        <div className="text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="20"
            max="400"
            required
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full text-center text-2xl font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Morning fasted weigh-in"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={weightMutation.isPending}>
            Save Weight
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogWeightModal;
