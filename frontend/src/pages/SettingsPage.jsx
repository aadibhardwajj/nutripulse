import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Laptop,
  Bell,
  Lock,
  Trash2,
  Sliders,
  ShieldAlert,
  Target,
  Check,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addToast = useUIStore((state) => state.addToast);

  const [activeSection, setActiveSection] = useState('appearance');
  const [confirmDeleteAccountOpen, setConfirmDeleteAccountOpen] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Goals state
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [targetCarbs, setTargetCarbs] = useState(250);
  const [targetProtein, setTargetProtein] = useState(125);
  const [targetFat, setTargetFat] = useState(55);
  const [targetWater, setTargetWater] = useState(2500);

  // Unit system
  const [unitSystem, setUnitSystem] = useState('metric');

  // Load current settings
  const { data: profileRes } = useQuery({
    queryKey: ['settingsProfile'],
    queryFn: async () => {
      const res = await api.get('/profile');
      if (res.data?.goals) {
        setDailyCalories(res.data.goals.dailyCalories || 2000);
        setTargetCarbs(res.data.goals.targetCarbsGrams || 250);
        setTargetProtein(res.data.goals.targetProteinGrams || 125);
        setTargetFat(res.data.goals.targetFatGrams || 55);
        setTargetWater(res.data.goals.targetWaterMl || 2500);
      }
      if (res.data?.profile?.unitSystem) {
        setUnitSystem(res.data.profile.unitSystem);
      }
      return res.data;
    },
  });

  // Goals update mutation
  const updateGoalsMutation = useMutation({
    mutationFn: (payload) => api.patch('/profile/goals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      addToast('Daily nutritional goals updated!', 'success');
    },
  });

  // Units update mutation
  const updateUnitsMutation = useMutation({
    mutationFn: (system) => api.patch('/profile', { unitSystem: system }),
    onSuccess: (_, system) => {
      setUnitSystem(system);
      addToast(`Unit system updated to ${system}`, 'success');
    },
  });

  // Password mutation
  const passwordMutation = useMutation({
    mutationFn: (payload) => api.post('/auth/change-password', payload),
    onSuccess: () => {
      addToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setPasswordError('');
    },
    onError: (err) => {
      setPasswordError(err.message || 'Failed to update password');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => api.delete('/auth/account'),
    onSuccess: async () => {
      await logout();
      addToast('Your account was permanently deleted.', 'info');
      navigate('/register');
    },
  });

  const handleSaveGoals = (e) => {
    e.preventDefault();
    updateGoalsMutation.mutate({
      dailyCalories: Number(dailyCalories),
      targetCarbsGrams: Number(targetCarbs),
      targetProteinGrams: Number(targetProtein),
      targetFatGrams: Number(targetFat),
      targetWaterMl: Number(targetWater),
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const handleDeleteAccount = () => {
    setConfirmDeleteAccountOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage appearance, goals, notification schedules, and security"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 space-y-1">
          {[
            { key: 'appearance', label: 'Appearance', icon: Sun },
            { key: 'goals', label: 'Nutritional Goals', icon: Target },
            { key: 'units', label: 'Units & Metrics', icon: Sliders },
            { key: 'security', label: 'Security & Account', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeSection === tab.key
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Contents */}
        <div className="md:col-span-3">
          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Display Appearance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select how NutriPulse looks on your device.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    theme === 'light'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <span className="text-sm font-bold block">Light</span>
                  <span className="text-[11px] text-slate-400">Clean & bright</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    theme === 'dark'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Moon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <span className="text-sm font-bold block">Dark</span>
                  <span className="text-[11px] text-slate-400">Deep slate contrast</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    theme === 'system'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Laptop className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <span className="text-sm font-bold block">System Auto</span>
                  <span className="text-[11px] text-slate-400">Matches device OS</span>
                </button>
              </div>
            </Card>
          )}

          {/* Goals Section */}
          {activeSection === 'goals' && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Nutritional Targets
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fine-tune your daily calorie budget and target macronutrient gram distribution.
                </p>
              </div>

              <form onSubmit={handleSaveGoals} className="space-y-4">
                <Input
                  label="Daily Calorie Target (kcal)"
                  type="number"
                  min="1000"
                  max="8000"
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Carbs (g)"
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                  />
                  <Input
                    label="Protein (g)"
                    type="number"
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(e.target.value)}
                  />
                  <Input
                    label="Fat (g)"
                    type="number"
                    value={targetFat}
                    onChange={(e) => setTargetFat(e.target.value)}
                  />
                </div>

                <Input
                  label="Daily Hydration Goal (ml)"
                  type="number"
                  step="100"
                  min="500"
                  value={targetWater}
                  onChange={(e) => setTargetWater(e.target.value)}
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" isLoading={updateGoalsMutation.isPending}>
                    Update Targets
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Units Section */}
          {activeSection === 'units' && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Measurement Units
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose your preferred system of units across the app.
                </p>
              </div>

              <div className="space-y-2">
                <div
                  onClick={() => updateUnitsMutation.mutate('metric')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    unitSystem === 'metric'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Metric System</p>
                    <p className="text-xs text-slate-500">Kilograms (kg), Centimeters (cm), Milliliters (ml)</p>
                  </div>
                  {unitSystem === 'metric' && <Check className="w-5 h-5 text-emerald-600" />}
                </div>

                <div
                  onClick={() => updateUnitsMutation.mutate('imperial')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    unitSystem === 'imperial'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Imperial System</p>
                    <p className="text-xs text-slate-500">Pounds (lbs), Inches (in), Fluid Ounces (fl oz)</p>
                  </div>
                  {unitSystem === 'imperial' && <Check className="w-5 h-5 text-emerald-600" />}
                </div>
              </div>
            </Card>
          )}

          {/* Security & Account Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Change Password
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your account login credentials.
                  </p>
                </div>

                {passwordError && (
                  <p className="text-xs font-semibold text-red-500">{passwordError}</p>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <Input
                    label="Current Password"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={passwordMutation.isPending}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Danger Zone
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permanently erase your NutriPulse profile, nutrition logs, and workout history.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Delete Account & Data
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteAccount}
                    isLoading={deleteAccountMutation.isPending}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete Account
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDeleteAccountOpen}
        onClose={() => setConfirmDeleteAccountOpen(false)}
        onConfirm={() => deleteAccountMutation.mutate()}
        title="Permanently delete your account?"
        message="This action cannot be undone. All your biometrics, daily food logs, recipes, workout routines, and historical analytics will be permanently erased."
        confirmText="Delete My Account"
        isLoading={deleteAccountMutation.isPending}
        isDestructive={true}
      />
    </div>
  );
};

export default SettingsPage;
