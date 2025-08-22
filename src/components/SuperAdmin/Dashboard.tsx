'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Dashboard() {
  const [selectedSchool, setSelectedSchool] = useState('All Schools');

  const allStats = {
    'All Schools': {
      stats: [
        { title: 'Total Schools Registered', value: 120 },
        { title: 'Active Schools', value: 95 },
        { title: 'Pending Approval', value: 25 },
        { title: 'Revenue', value: 4500 },
        { title: 'Total Teachers/Staff', value: 320 },
      ],
      userGrowth: [30, 45, 35, 50, 55, 60],
    },
    'School A': {
      stats: [
        { title: 'Total Schools Registered', value: 1 },
        { title: 'Active Schools', value: 1 },
        { title: 'Inactive Schools', value: 0 },
        { title: 'Total Students', value: 500 },
        { title: 'Total Teachers/Staff', value: 40 },
      ],
      userGrowth: [5, 10, 8, 12, 15, 18],
    },
    'School B': {
      stats: [
        { title: 'Total Schools Registered', value: 1 },
        { title: 'Active Schools', value: 0 },
        { title: 'Inactive Schools', value: 1 },
        { title: 'Total Students', value: 300 },
        { title: 'Total Teachers/Staff', value: 25 },
      ],
      userGrowth: [2, 4, 3, 5, 6, 7],
    },
    'School C': {
      stats: [
        { title: 'Total Schools Registered', value: 1 },
        { title: 'Active Schools', value: 1 },
        { title: 'Inactive Schools', value: 0 },
        { title: 'Total Students', value: 450 },
        { title: 'Total Teachers/Staff', value: 35 },
      ],
      userGrowth: [4, 7, 6, 9, 10, 12],
    },
  };

  const currentStats = allStats[selectedSchool].stats;
  const currentUserGrowth = allStats[selectedSchool].userGrowth;

  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const userGrowthOptions = {
    chart: { id: 'user-growth', toolbar: { show: false }, foreColor: 'var(--text)',background: 'var(--surface)', },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
       stroke: {
    curve: 'smooth',
    colors: ['var(--primary)'] // <-- change this to any HEX, RGB, or array of colors
  },
  };

  const userGrowthSeries = [{ name: 'New Users', data: currentUserGrowth }];

  const financeOptions = {
    chart: { type: 'donut', foreColor: 'var(--text)' ,background: 'var(--surface)',},
    labels: ['Subscribed', 'Not Subscribed'],
    colors: ['var(--primary)', 'var(--danger)'],
    theme: { mode: 'dark' },
    
  };

  const financeSeries = [80, 40];

  const revenueOptions = {
    chart: { id: 'revenue', toolbar: { show: false }, foreColor: 'var(--text)' ,background: 'var(--surface)',},
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    theme: { mode: 'dark' },
       stroke: {
    curve: 'smooth',
    colors: ['var(--primary)'] 
  },
  };

  const revenueSeries = [{ name: 'Revenue', data: [5000, 7000, 6000, 8000, 7500, 9000] }];

  return (
    <div className="flex flex-col gap-8">
     
      {/* School Filter */}
      <div>
        <label className="mr-2">Filter by School:</label>
        <select
          className="px-3 py-2 border rounded bg-surface text-text"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          {Object.keys(allStats).map((school) => (
            <option key={school}>{school}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {currentStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-lg shadow bg-surface flex flex-col items-center"
          >
            <span className="text-muted text-sm mb-2">{stat.title}</span>
            <span className="text-2xl font-bold text-primary">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* User Growth Chart */}
      <div className="bg-surface p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">User Growth (Last 6 Months)</h2>
        <Chart  options={userGrowthOptions} series={userGrowthSeries} type="line" height={300} />
      </div>

      {/* Finance Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Subscription Overview</h2>
          <Chart options={financeOptions} series={financeSeries} type="donut" height={300} />
        </div>

        <div className="bg-surface p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Revenue Tracking</h2>
          <Chart options={revenueOptions} series={revenueSeries} type="line" height={300} />
        </div>
      </div>
    </div>
  );
}
