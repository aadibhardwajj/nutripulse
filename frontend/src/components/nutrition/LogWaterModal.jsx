import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Droplets, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useUIStore } from '../../store/useUIStore';
import api from '../../services/api';

export const LogWaterModal = () => {
  const queryClient = useQueryClient();
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const selectedDate = useUIStore((state) => state.selectedDate);
  const addToast = useUIStore((state) => state.addToast);

  const isOpen = activeModal === 'logWater';
  const [customAmount, setCustomAmount] = useState(250);

  const waterMutation = useMutation({
    mutationFn: (amountMl) => api.post('/water', { date: selectedDate, amountMl }),
    onSuccess: (_, amountMl) => {
      queryClient.invalidateQueries({ queryKey: ['water'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast(`Added ${amountMl} ml of water!`, 'success');
      closeModal();
    },
    onError: (err) => {
      addToast(err.message || 'Failed to log water', 'error');
    },
  });

  const handleQuickAdd = (amountMl) => {
    waterMutation.mutate(amountMl);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Track Hydration"
      subtitle={`Logging water for ${selectedDate}`}
      maxWidth="max-w-sm"
    >
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 mx-auto flex items-center justify-center">
          <Droplets className="w-8 h-8" />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Stay energized and maintain metabolic rate with steady hydration throughout your day.
        </p>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[250, 500, 750].map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={waterMutation.isPending}
              onClick={() => handleQuickAdd(amt)}
              className="py-3 px-2 rounded-xl border border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-bold text-sm transition-all"
            >
              +{amt} ml
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="pt-2 text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
            Custom Amount (ml)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="50"
              min="50"
              max="5000"
              value={customAmount}
              onChange={(e) => setCustomAmount(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
            />
            <Button
              variant="primary"
              onClick={() => handleQuickAdd(customAmount)}
              isLoading={waterMutation.isPending}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LogWaterModal;
