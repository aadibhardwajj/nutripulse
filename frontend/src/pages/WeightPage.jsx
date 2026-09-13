import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scale, Plus, Ruler, TrendingDown } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';

export const WeightPage = () => {
  const queryClient = useQueryClient();
  const selectedDate = useUIStore((state) => state.selectedDate);
  const openModal = useUIStore((state) => state.openModal);
  const addToast = useUIStore((state) => state.addToast);

  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [hipsCm, setHipsCm] = useState('');
  const [armsCm, setArmsCm] = useState('');

  // Fetch weight logs
  const { data: weightRes, isLoading: isWeightLoading } = useQuery({
    queryKey: ['weight'],
    queryFn: () => api.get('/weight'),
  });

  // Fetch measurements
  const { data: measureRes } = useQuery({
    queryKey: ['measurements'],
    queryFn: () => api.get('/weight/measurements'),
  });

  const logs = weightRes?.data?.logs || [];
  const currentWeight = weightRes?.data?.currentWeightKg;
  const targetWeight = weightRes?.data?.targetWeightKg;
  const measurements = measureRes?.data?.measurements || [];

  const logMeasurementMutation = useMutation({
    mutationFn: (payload) => api.post('/weight/measurements', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      addToast('Circumference measurements recorded!', 'success');
      setMeasurementModalOpen(false);
    },
  });

  const handleSaveMeasurements = (e) => {
    e.preventDefault();
    logMeasurementMutation.mutate({
      date: selectedDate,
      waistCm: waistCm ? Number(waistCm) : undefined,
      chestCm: chestCm ? Number(chestCm) : undefined,
      hipsCm: hipsCm ? Number(hipsCm) : undefined,
      armsCm: armsCm ? Number(armsCm) : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weight & Body Metrics"
        subtitle="Track long-term body milestones and measurements with objective health data"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMeasurementModalOpen(true)}
              leftIcon={<Ruler className="w-4 h-4" />}
            >
              Log Dimensions
            </Button>
            <Button
              variant="primary"
              onClick={() => openModal('logWeight')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log Weight
            </Button>
          </div>
        }
      />

      {/* Target Progress Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Current Weight</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {currentWeight || '--'} <span className="text-xs font-normal">kg</span>
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Target Goal</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {targetWeight || '--'} <span className="text-xs font-normal">kg</span>
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Entries</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {logs.length} <span className="text-xs font-normal">records</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Weight History Table */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          Weight History
        </h3>

        {logs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <div key={log._id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {log.date}
                  </span>
                  {log.notes && <span className="text-xs text-slate-400 block">{log.notes}</span>}
                </div>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                  {log.weightKg} kg
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            No weight entries logged yet. Tap "Log Weight" above to get started.
          </p>
        )}
      </Card>

      {/* Circumference Measurements Table */}
      {measurements.length > 0 && (
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Body Circumference Measurements
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {measurements.map((m) => (
              <div key={m._id} className="py-3 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">{m.date}</span>
                <div className="flex gap-4 text-slate-500">
                  {m.waistCm && <span>Waist: {m.waistCm}cm</span>}
                  {m.chestCm && <span>Chest: {m.chestCm}cm</span>}
                  {m.hipsCm && <span>Hips: {m.hipsCm}cm</span>}
                  {m.armsCm && <span>Arms: {m.armsCm}cm</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Circumference Modal */}
      <Modal
        isOpen={measurementModalOpen}
        onClose={() => setMeasurementModalOpen(false)}
        title="Record Body Dimensions"
        subtitle={`Measurements for ${selectedDate}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveMeasurements} className="space-y-4">
          <Input
            label="Waist (cm)"
            type="number"
            step="0.5"
            placeholder="e.g. 80"
            value={waistCm}
            onChange={(e) => setWaistCm(e.target.value)}
          />
          <Input
            label="Chest (cm)"
            type="number"
            step="0.5"
            placeholder="e.g. 96"
            value={chestCm}
            onChange={(e) => setChestCm(e.target.value)}
          />
          <Input
            label="Hips (cm)"
            type="number"
            step="0.5"
            placeholder="e.g. 95"
            value={hipsCm}
            onChange={(e) => setHipsCm(e.target.value)}
          />
          <Input
            label="Arms / Biceps (cm)"
            type="number"
            step="0.5"
            placeholder="e.g. 35"
            value={armsCm}
            onChange={(e) => setArmsCm(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setMeasurementModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={logMeasurementMutation.isPending}>
              Save Dimensions
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WeightPage;
