'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CustomSelect from '@/components/ui/CustomSelect';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type SchoolStat = {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  totalStudents: number;
  totalTeachers: number;
};

type DashboardData = {
  totalSchools: number;
  activeSchools: number;
  pendingApplications: number;
  totalTeachers: number;
  totalStudents: number;
  userGrowthMonths: string[];
  userGrowthCounts: number[];
  schools: SchoolStat[];
};


export default function Dashboard({ data }: { data: DashboardData }) {
  const [selectedSchool, setSelectedSchool] = useState('all');

  const selectedSchoolData = data.schools.find((s) => s.id === selectedSchool);

  const stats =
    selectedSchool === 'all'
      ? [
          { title: 'Total Schools Registered', value: data.totalSchools },
          { title: 'Active Schools', value: data.activeSchools },
          { title: 'Inactive Schools', value: data.totalSchools - data.activeSchools },
          { title: 'Pending Applications', value: data.pendingApplications },
          { title: 'Total Teachers / Staff', value: data.totalTeachers },
          { title: 'Total Students', value: data.totalStudents },
        ]
      : selectedSchoolData
      ? [
          { title: 'Status', value: selectedSchoolData.isActive ? 'Active' : 'Inactive' },
          { title: 'Total Students', value: selectedSchoolData.totalStudents },
          { title: 'Total Teachers / Staff', value: selectedSchoolData.totalTeachers },
        ]
      : [];

  const isDarkMode =
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const userGrowthOptions = {
    chart: {
      id: 'user-growth',
      toolbar: { show: false },
      foreColor: 'var(--text)',
      background: 'var(--surface)',
    },
    xaxis: { categories: data.userGrowthMonths },
    theme: { mode: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light' },
    stroke: { curve: 'smooth' as const, colors: ['var(--primary)'] },
  };

  const userGrowthSeries = [{ name: 'New Users', data: data.userGrowthCounts }];

  const financeOptions = {
    chart: { type: 'donut' as const, foreColor: 'var(--text)', background: 'var(--surface)' },
    labels: ['Subscribed', 'Not Subscribed'],
    colors: ['var(--primary)', 'var(--danger)'],
    theme: { mode: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light' },
  };

  const financeSeries = [0, 0];

  const revenueOptions = {
    chart: {
      id: 'revenue',
      toolbar: { show: false },
      foreColor: 'var(--text)',
      background: 'var(--surface)',
    },
    xaxis: { categories: data.userGrowthMonths },
    theme: { mode: (isDarkMode ? 'dark' : 'light') as 'dark' | 'light' },
    stroke: { curve: 'smooth' as const, colors: ['var(--primary)'] },
  };

  const revenueSeries = [{ name: 'Revenue', data: [0, 0, 0, 0, 0, 0] }];

  return (
    <div className="flex flex-col gap-8">
      {/* School Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[var(--text)]">Filter by School:</label>
        <CustomSelect
          value={selectedSchool}
          onChange={setSelectedSchool}
          options={[
            { value: 'all', label: 'All Schools' },
            ...data.schools.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl shadow bg-surface flex flex-col items-center gap-1"
          >
            <span className="text-text text-xs text-center">{stat.title}</span>
            <span className="text-2xl font-bold text-[var(--primary)]">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* User Growth Chart */}
      <div className="bg-surface p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">User Growth (Last 6 Months)</h2>
        <Chart options={userGrowthOptions} series={userGrowthSeries} type="line" height={300} />
      </div>

      {/* Finance & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Subscription Overview</h2>
          <p className="text-xs text-[var(--muted)] mb-2">Coming soon</p>
          <Chart options={financeOptions} series={financeSeries} type="donut" height={300} />
        </div>

        <div className="bg-surface p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Revenue Tracking</h2>
          <p className="text-xs text-[var(--muted)] mb-2">Coming soon</p>
          <Chart options={revenueOptions} series={revenueSeries} type="line" height={300} />
        </div>
      </div>
    </div>
  );
}
