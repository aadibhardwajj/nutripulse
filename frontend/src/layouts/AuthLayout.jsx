import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ToastContainer } from '../components/common/ToastContainer';
import { useThemeStore } from '../store/useThemeStore';
import { Sun, Moon, Laptop } from 'lucide-react';

export const AuthLayout = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Nutri<span className="text-emerald-500">Pulse</span>
          </span>
        </Link>

        {/* Quick Theme Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-lg text-xs">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-white text-amber-500 shadow-xs' : 'text-slate-500'}`}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-slate-900 text-indigo-400 shadow-xs' : 'text-slate-500'}`}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-md ${theme === 'system' ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-xs' : 'text-slate-500'}`}
            title="System Mode"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Form Box */}
      <main className="flex-1 flex items-center justify-center py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-slate-400 py-2">
        <p>&copy; {new Date().getFullYear()} NutriPulse Health Technologies. All rights reserved.</p>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default AuthLayout;
