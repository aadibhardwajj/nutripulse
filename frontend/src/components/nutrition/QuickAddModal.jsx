import React from 'react';
import { Apple, Droplets, Flame, Scale } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useUIStore } from '../../store/useUIStore';

export const QuickAddModal = () => {
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const openModal = useUIStore((state) => state.openModal);

  const isOpen = activeModal === 'quickAdd';

  const handleSelect = (modalName) => {
    closeModal();
    setTimeout(() => {
      openModal(modalName);
    }, 100);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Quick Log"
      subtitle="What would you like to track right now?"
      maxWidth="max-w-sm"
    >
      <div className="grid grid-cols-2 gap-3 py-2">
        <button
          onClick={() => handleSelect('foodSearch')}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Apple className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Log Food</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Meal entries</span>
        </button>

        <button
          onClick={() => handleSelect('logWater')}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Droplets className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Log Water</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Daily hydration</span>
        </button>

        <button
          onClick={() => handleSelect('logExercise')}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Exercise</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Burned calories</span>
        </button>

        <button
          onClick={() => handleSelect('logWeight')}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Scale className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Weight</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Body milestones</span>
        </button>
      </div>
    </Modal>
  );
};

export default QuickAddModal;
