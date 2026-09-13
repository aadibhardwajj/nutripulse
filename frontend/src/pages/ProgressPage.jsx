import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { useTheme } from '../hooks/useTheme';
import api from '../services/api';

export const ProgressPage = () => {
  const { isDark } = useTheme();
  const [range, setRange] = useState('7d'); // '7d' | '30d' | '90d' | '180d' | '365d'
  const [metricTab, setMetricTab] = useState('calories'); // 'calories' | 'weight' | 'macros' | 'water' | 'exercise'

  const { data: progressRes, isLoading } = useQuery({
    queryKey: ['progress', range],
    queryFn: () => api.get(`/progress?range=${range}`),
  });

  const chartData = progressRes?.data?.chartData || [];
  const averages = progressRes?.data?.averages || {};

  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    backgroundColor: isDark ? '#111827' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  };

  const ranges = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '3 Months' },
    { key: '180d', label: '6 Months' },
    { key: '365d', label: '1 Year' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Progress Analytics"
          subtitle="Analyze trends across caloric balance, macronutrients, body weight, and exercise"
        />

        {/* Date Range Selector Buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Averages Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Daily Intake</span>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">{averages.calories || 0} kcal</p>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Protein</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{averages.protein || 0} g</p>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Hydration</span>
          <p className="text-xl font-black text-cyan-600 dark:text-cyan-400">{averages.waterMl || 0} ml</p>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Active Time</span>
          <p className="text-xl font-black text-amber-500">{averages.totalExerciseMinutes || 0} mins</p>
        </Card>
      </div>

      {/* Metric Tab Controls */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'calories', label: 'Calories vs Target' },
          { key: 'macros', label: 'Macronutrient Splits' },
          { key: 'weight', label: 'Body Weight Trend' },
          { key: 'water', label: 'Hydration Intake' },
          { key: 'exercise', label: 'Exercise Calories Burned' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMetricTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              metricTab === tab.key
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Responsive Recharts Container */}
      <Card className="p-6">
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {metricTab === 'calories' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="shortDate" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="calories" name="Consumed Calories" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="targetCalories" name="Daily Target" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </BarChart>
              ) : metricTab === 'macros' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="shortDate" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="carbs" name="Carbs (g)" fill="#06B6D4" stackId="a" />
                  <Bar dataKey="protein" name="Protein (g)" fill="#10B981" stackId="a" />
                  <Bar dataKey="fat" name="Fat (g)" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : metricTab === 'weight' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="shortDate" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="weightKg"
                    name="Weight (kg)"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8B5CF6' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : metricTab === 'water' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="shortDate" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="waterMl" name="Water (ml)" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="targetWaterMl" name="Target (ml)" stroke="#64748B" strokeDasharray="5 5" dot={false} />
                </BarChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="shortDate" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="exerciseCalories" name="Calories Burned" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProgressPage;
