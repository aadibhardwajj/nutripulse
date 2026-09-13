import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Sparkles, Shield, Save } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);

  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile'),
  });

  const p = profileRes?.data?.profile || {};
  const goals = profileRes?.data?.goals || {};

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [heightCm, setHeightCm] = useState(175);
  const [currentWeightKg, setCurrentWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(70);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (p.bio) setBio(p.bio);
    if (p.heightCm) setHeightCm(p.heightCm);
    if (p.currentWeightKg) setCurrentWeightKg(p.currentWeightKg);
    if (p.targetWeightKg) setTargetWeightKg(p.targetWeightKg);
  }, [user, p]);

  const updateMutation = useMutation({
    mutationFn: (payload) => api.patch('/profile', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Profile updated successfully!', 'success');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      name,
      bio,
      heightCm: Number(heightCm),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: Number(targetWeightKg),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal biometrics and account identity"
      />

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-400 font-black text-2xl flex items-center justify-center">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{name || 'User'}</h2>
              {user?.isPremium && <Badge variant="amber">Premium Member</Badge>}
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Short Bio / Fitness Statement
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Training for half marathon & muscle hypertrophy."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Height (cm)"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
            <Input
              label="Current Weight (kg)"
              type="number"
              step="0.1"
              value={currentWeightKg}
              onChange={(e) => setCurrentWeightKg(e.target.value)}
            />
            <Input
              label="Target Weight (kg)"
              type="number"
              step="0.1"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
