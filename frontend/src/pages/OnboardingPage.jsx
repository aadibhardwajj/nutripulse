import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Sparkles, User, Target, Activity, Flame } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';
import { GOAL_TYPES, ACTIVITY_LEVELS } from '../constants/config';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUserData = useAuthStore((state) => state.updateUserData);
  const addToast = useUIStore((state) => state.addToast);

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('female');
  const [dateOfBirth, setDateOfBirth] = useState('1998-06-20');
  const [heightCm, setHeightCm] = useState(168);
  const [currentWeightKg, setCurrentWeightKg] = useState(65);
  const [targetWeightKg, setTargetWeightKg] = useState(62);
  const [goal, setGoal] = useState('lose_weight');
  const [activityLevel, setActivityLevel] = useState('lightly_active');
  const [dietaryPreference, setDietaryPreference] = useState('standard');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationSummary, setCalculationSummary] = useState(null);

  const handleNext = () => {
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        gender,
        dateOfBirth,
        heightCm: Number(heightCm),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: Number(targetWeightKg),
        activityLevel,
        goal,
        dietaryPreference,
      };

      const res = await api.post('/auth/onboarding', payload);
      setCalculationSummary(res.data.calculations);
      updateUserData({ onboardingCompleted: true });
      addToast('Profile calibrated successfully!', 'success');
      setStep(4); // Final summary step
    } catch (err) {
      addToast(err.message || 'Failed to save onboarding data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="p-6 sm:p-8 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">Step {step} of 4</span>
        </div>

        {/* Step 1: Personal Measurements */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Tell Us About Yourself
              </h3>
              <p className="text-xs text-slate-500">
                We use these baseline biometric metrics to calculate your precise metabolic rate.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Biological Sex (For BMR equation)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['female', 'male', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold capitalize border transition-all ${
                      gender === g
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Date of Birth"
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Height (cm)"
                type="number"
                min="50"
                max="250"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
              <Input
                label="Current Weight (kg)"
                type="number"
                min="20"
                max="300"
                required
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
              />
              <Input
                label="Target Weight (kg)"
                type="number"
                min="20"
                max="300"
                required
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Your Goal
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Goal & Activity */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Your Health Goal & Activity
              </h3>
              <p className="text-xs text-slate-500">
                Define what you want to accomplish and how active your lifestyle is.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Primary Goal
              </label>
              <div className="space-y-2">
                {GOAL_TYPES.map((g) => (
                  <div
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      goal === g.value
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <p className="text-sm font-bold">{g.label}</p>
                    <p className="text-xs text-slate-500">{g.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Activity Level
              </label>
              <div className="space-y-1.5">
                {ACTIVITY_LEVELS.map((a) => (
                  <div
                    key={a.value}
                    onClick={() => setActivityLevel(a.value)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      activityLevel === a.value
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <p className="text-xs font-bold">{a.label}</p>
                    <p className="text-[11px] text-slate-500">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Preferences
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Dietary Preferences & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Dietary Focus
              </h3>
              <p className="text-xs text-slate-500">
                Select your nutritional framework to tailor food suggestions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'standard', label: 'Balanced / Standard' },
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'vegan', label: 'Plant-based Vegan' },
                { value: 'keto', label: 'Ketogenic (Low Carb)' },
                { value: 'paleo', label: 'Paleo' },
                { value: 'pescatarian', label: 'Pescatarian' },
              ].map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDietaryPreference(d.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    dietaryPreference === d.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs">{d.label}</p>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-200">Biometric Review:</span>
              <p className="text-slate-500">
                {gender}, {heightCm} cm, {currentWeightKg} kg → Target: {targetWeightKg} kg ({goal.replace('_', ' ')})
              </p>
            </div>

            <div className="pt-2 flex justify-between">
              <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Calculate My Plan
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Final Summary & Launch */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Your Personalized Plan is Ready!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Calibrated with scientific BMR and metabolic multipliers.
              </p>
            </div>

            {calculationSummary && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Daily Calorie Target</span>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {calculationSummary.targetCalories} <span className="text-sm font-semibold">kcal/day</span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>BMR: {calculationSummary.bmr} kcal</p>
                    <p>TDEE: {calculationSummary.tdee} kcal</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-cyan-600 uppercase">Carbs</span>
                    <p className="text-base font-extrabold">{calculationSummary.macros?.carbs}g</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Protein</span>
                    <p className="text-base font-extrabold">{calculationSummary.macros?.protein}g</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Fat</span>
                    <p className="text-base font-extrabold">{calculationSummary.macros?.fat}g</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Go to My Dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OnboardingPage;
