import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PlusCircle, TrendingUp, MoreHorizontal } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const MobileNav = () => {
  const openModal = useUIStore((state) => state.openModal);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 p-1 text-[11px] font-semibold transition-colors ${
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/diary"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 p-1 text-[11px] font-semibold transition-colors ${
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <BookOpen className="w-5 h-5" />
        <span>Diary</span>
      </NavLink>

      {/* Floating Plus button */}
      <button
        onClick={() => openModal('quickAdd')}
        className="flex flex-col items-center -mt-5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full p-3 shadow-lg hover:scale-105 active:scale-95 transition-transform"
        aria-label="Quick log item"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      <NavLink
        to="/progress"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 p-1 text-[11px] font-semibold transition-colors ${
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <TrendingUp className="w-5 h-5" />
        <span>Progress</span>
      </NavLink>

      <button
        onClick={toggleSidebar}
        className="flex flex-col items-center gap-0.5 p-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span>More</span>
      </button>
    </nav>
  );
};

export default MobileNav;
