import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Apple,
  Flame,
  Droplets,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronDown,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useThemeStore } from '../store/useThemeStore';

export const LandingPage = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How does NutriPulse calculate my daily calorie target?',
      a: 'We utilize the scientifically validated Mifflin-St Jeor equation to compute your Basal Metabolic Rate (BMR), factoring in your activity multiplier and tailored weight goal (deficit, maintenance, or surplus).',
    },
    {
      q: 'Can I track both nutrition and strength training?',
      a: 'Absolutely. You can log cardio activities with estimated MET expenditure and also track structured resistance training routines with sets, reps, and weight.',
    },
    {
      q: 'Is there a dark mode?',
      a: 'Yes! NutriPulse features a dedicated 3-mode appearance engine: Light, Dark, and System Default, tailored to reduce eye strain and look gorgeous on all displays.',
    },
    {
      q: 'Is my health data secure and private?',
      a: 'Your information is encrypted with industry-standard cryptographic hashing and secure JWT tokens. We never sell your personal metrics.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight">
              Nutri<span className="text-emerald-500">Pulse</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-white text-amber-500 shadow-xs' : 'text-slate-500'}`}
                title="Light"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-slate-900 text-indigo-400 shadow-xs' : 'text-slate-500'}`}
                title="Dark"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-md ${theme === 'system' ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-xs' : 'text-slate-500'}`}
                title="System"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Nutrition & Fitness Tracking</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Master Your Nutrition with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Precision & Vitality
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            NutriPulse simplifies your health journey. Log meals in seconds, optimize macronutrients, track workouts, and cultivate sustainable vitality.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Free Today
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Demo Account
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Scientific BMR/TDEE
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
            </span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-100/60 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Designed for Consistency and Ease
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Everything you need to stay on top of your physical goals without the friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="app-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Apple className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Fast Food Diary</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Log Breakfast, Lunch, Dinner, and Snacks with instant portion recalculations and verified nutritional databases.
              </p>
            </div>

            <div className="app-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Smart Hydration</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                One-tap quick hydration logging (+250ml, +500ml) keeps your energy and cellular recovery at peak levels.
              </p>
            </div>

            <div className="app-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Workouts & Exercise</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track cardio, sports, and multi-set strength workouts with automatic MET-based calorie burn calculations.
              </p>
            </div>

            <div className="app-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Insightful Progress</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Visualize multi-week trends in body weight, calorie budgets, and macronutrient balances with responsive charts.
              </p>
            </div>

            <div className="app-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Recipe & Meal Builder</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Save your favorite multi-ingredient recipes and batch-log reusable meal sets with a single tap.
              </p>
            </div>

            <div className="app-card p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Privacy & Security</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Secure JWT authentication, encrypted credentials, and full data autonomy with zero intrusive trackers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How NutriPulse Works
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            A seamless three-step framework for sustainable wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h4 className="font-bold text-base">Personalize Your Goals</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete the guided onboarding to calculate your exact caloric baseline and macro distribution.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h4 className="font-bold text-base">Log Fast & Effortlessly</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Search verified foods or favorite recipes, log workouts, and track daily hydration on desktop or mobile.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h4 className="font-bold text-base">Review & Refine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analyze your weekly averages, celebrate weight milestones, and adjust your routine for lasting vitality.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="app-card p-4 cursor-pointer"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openFaq === idx && (
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center px-4">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Take Control of Your Health?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-emerald-100 max-w-xl mx-auto">
            Join thousands tracking nutrition with clarity, speed, and scientific rigor.
          </p>
          <div className="mt-8">
            <Link to="/register">
              <Button
                variant="white"
                size="lg"
                className="font-bold text-slate-950 dark:text-slate-950 px-8 py-3.5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-base"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} NutriPulse. Built for precision nutrition and fitness tracking.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
