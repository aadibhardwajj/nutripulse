import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { formatDateReadable, getTodayDateString } from '../../utils/dateUtils';

export const DateNavigator = ({ className = '' }) => {
  const selectedDate = useUIStore((state) => state.selectedDate);
  const setSelectedDate = useUIStore((state) => state.setSelectedDate);
  const goToPreviousDay = useUIStore((state) => state.goToPreviousDay);
  const goToNextDay = useUIStore((state) => state.goToNextDay);
  const goToToday = useUIStore((state) => state.goToToday);

  const isToday = selectedDate === getTodayDateString();

  return (
    <div className={`flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-subtle ${className}`}>
      <button
        onClick={goToPreviousDay}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative flex items-center gap-2 px-2 sm:px-3">
        <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap min-w-[100px] text-center">
          {formatDateReadable(selectedDate)}
        </span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          aria-label="Select date from calendar"
        />
      </div>

      <button
        onClick={goToNextDay}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {!isToday && (
        <button
          onClick={goToToday}
          className="ml-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
        >
          Today
        </button>
      )}
    </div>
  );
};

export default DateNavigator;
