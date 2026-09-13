import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { ToastContainer } from '../components/common/ToastContainer';
import { FoodSearchModal } from '../components/nutrition/FoodSearchModal';
import { LogWaterModal } from '../components/nutrition/LogWaterModal';
import { LogExerciseModal } from '../components/exercise/LogExerciseModal';
import { LogWeightModal } from '../components/progress/LogWeightModal';
import { QuickAddModal } from '../components/nutrition/QuickAddModal';
import { useAuthStore } from '../store/useAuthStore';

export const AppLayout = () => {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar on left */}
      <Sidebar />

      {/* Main Content column on right */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-12 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <MobileNav />
      <ToastContainer />

      {/* Global Interactive Modals */}
      <FoodSearchModal />
      <LogWaterModal />
      <LogExerciseModal />
      <LogWeightModal />
      <QuickAddModal />
    </div>
  );
};

export default AppLayout;
