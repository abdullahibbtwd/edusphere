'use client';

import React, { useState, useEffect } from 'react';
import { FaSchool } from 'react-icons/fa';
import { MdCancel, MdCheckCircle, MdOutlineAutorenew } from 'react-icons/md';
import { FiSettings, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import CustomSelect from '@/components/ui/CustomSelect';

type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';

interface SchoolSubscriptionInfo {
  id: string;
  planType: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  maxStudents: number;
  maxTeachers: number;
}

interface SchoolWithSubscription {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  isActive: boolean;
  totalStudents: number | null;
  totalTeachers: number | null;
  levelCount: number;
  studentCount: number;
  teacherCount: number;
  subscription: SchoolSubscriptionInfo | null;
}

const PLAN_OPTIONS = [
  { value: 'ALL', label: 'All plans' },
  { value: 'FREE', label: 'Free' },
  { value: 'BASIC', label: 'Basic' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
];

const PLAN_STYLES: Record<string, string> = {
  FREE: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  BASIC: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  PREMIUM: 'bg-[var(--primary)]/20 text-[var(--primary)]',
  ENTERPRISE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  CANCELLED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  SUSPENDED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

export default function SchoolSubscriptionManagement() {
  const [schools, setSchools] = useState<SchoolWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithSubscription | null>(null);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan>('BASIC');
  const [editStatus, setEditStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [editEndDate, setEditEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (planFilter !== 'ALL') params.set('plan', planFilter);
      const res = await fetch(`/api/admin/schools-subscriptions?${params}`);
      const data = await res.json();
      if (res.ok) setSchools(data.schools);
      else toast.error(data.error || 'Failed to load schools');
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [planFilter]);

  const filteredSchools = schools.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (school: SchoolWithSubscription) => {
    setSelectedSchool(school);
    const sub = school.subscription;
    setEditPlan((sub?.planType as SubscriptionPlan) || 'BASIC');
    setEditStatus((sub?.status as SubscriptionStatus) || 'ACTIVE');
    setEditEndDate(sub?.endDate ? sub.endDate.slice(0, 10) : '');
  };

  const handleSaveSubscription = async () => {
    if (!selectedSchool) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/schools-subscriptions/${selectedSchool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: editPlan,
          status: editStatus,
          endDate: editEndDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update subscription');
        return;
      }
      toast.success('Subscription updated');
      setSelectedSchool(null);
      fetchSchools();
    } catch {
      toast.error('Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const displayPlan = (school: SchoolWithSubscription) =>
    school.subscription?.planType ?? 'BASIC';
  const displayStatus = (school: SchoolWithSubscription) =>
    school.subscription?.status ?? 'ACTIVE';

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen font-poppins text-[var(--text)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">School & Subscription Management</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            View approved schools, subscription level, and manage plans
          </p>
        </div>
        <button
          onClick={() => fetchSchools()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] w-4 h-4" />
          <input
            type="text"
            placeholder="Search by school name, subdomain, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <CustomSelect
          value={planFilter}
          onChange={setPlanFilter}
          options={PLAN_OPTIONS}
          className="w-full sm:w-48"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
            <FaSchool className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No schools found</p>
            <p className="text-sm mt-1">
              {planFilter !== 'ALL' ? 'Try changing the plan filter.' : 'Approved schools will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  <th className="px-5 py-4">School</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Levels</th>
                  <th className="px-5 py-4">Students / Teachers</th>
                  <th className="px-5 py-4">Expiry</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredSchools.map((school, idx) => (
                  <motion.tr
                    key={school.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-[var(--bg)]/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                          <FaSchool size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-[var(--text)]">{school.name}</div>
                          <div className="text-xs text-[var(--primary)]">{school.subdomain}.edusphere.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          PLAN_STYLES[displayPlan(school)] ?? PLAN_STYLES.BASIC
                        }`}
                      >
                        {displayPlan(school)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLES[displayStatus(school)] ?? STATUS_STYLES.ACTIVE
                        }`}
                      >
                        {displayStatus(school)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text)]">{school.levelCount}</td>
                    <td className="px-5 py-4 text-sm text-[var(--text)]">
                      {school.studentCount} / {school.teacherCount}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--muted)]">
                      {school.subscription?.endDate
                        ? new Date(school.subscription.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEdit(school)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-sm font-medium transition-colors"
                      >
                        <FiSettings size={14} />
                        Manage
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit subscription modal */}
      <AnimatePresence>
        {selectedSchool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => !saving && setSelectedSchool(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-2xl shadow-xl max-w-md w-full border border-[var(--border)] overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text)]">
                  Update subscription · {selectedSchool.name}
                </h2>
                <button
                  onClick={() => !saving && setSelectedSchool(null)}
                  className="p-2 rounded-lg hover:bg-[var(--bg)] text-[var(--muted)]"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Plan</label>
                  <CustomSelect
                    value={editPlan}
                    onChange={(v) => setEditPlan(v as SubscriptionPlan)}
                    options={[
                      { value: 'FREE', label: 'Free' },
                      { value: 'BASIC', label: 'Basic' },
                      { value: 'PREMIUM', label: 'Premium' },
                      { value: 'ENTERPRISE', label: 'Enterprise' },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Status</label>
                  <CustomSelect
                    value={editStatus}
                    onChange={(v) => setEditStatus(v as SubscriptionStatus)}
                    options={[
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'EXPIRED', label: 'Expired' },
                      { value: 'CANCELLED', label: 'Cancelled' },
                      { value: 'SUSPENDED', label: 'Suspended' },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">End date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-[var(--border)] flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedSchool(null)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSubscription}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
