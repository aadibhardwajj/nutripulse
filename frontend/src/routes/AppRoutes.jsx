import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import { Skeleton } from '../components/common/Skeleton';

// Public & Static Core Pages
import LandingPage from '../pages/LandingPage';
import NotFoundPage from '../pages/NotFoundPage';

// Lazy-loaded Authenticated & Heavy Pages
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const DiaryPage = lazy(() => import('../pages/DiaryPage'));
const FoodsPage = lazy(() => import('../pages/FoodsPage'));
const FoodDetailPage = lazy(() => import('../pages/FoodDetailPage'));
const MealsPage = lazy(() => import('../pages/MealsPage'));
const RecipesPage = lazy(() => import('../pages/RecipesPage'));
const RecipeDetailPage = lazy(() => import('../pages/RecipeDetailPage'));
const ExercisePage = lazy(() => import('../pages/ExercisePage'));
const WorkoutsPage = lazy(() => import('../pages/WorkoutsPage'));
const WaterPage = lazy(() => import('../pages/WaterPage'));
const ProgressPage = lazy(() => import('../pages/ProgressPage'));
const WeightPage = lazy(() => import('../pages/WeightPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

const PageLoader = () => (
  <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
    </div>
    <Skeleton className="h-96 w-full rounded-2xl" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Authenticated App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/foods" element={<FoodsPage />} />
            <Route path="/foods/:id" element={<FoodDetailPage />} />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/exercise" element={<ExercisePage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/water" element={<WaterPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/weight" element={<WeightPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Accessible 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

