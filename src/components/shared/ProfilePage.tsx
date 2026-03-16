'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  FiCamera, FiLock, FiMail, FiPhone, FiUser,
  FiCalendar, FiMapPin, FiShield, FiEdit2, FiCheck,
  FiEye, FiEyeOff,
} from 'react-icons/fi';
import Image from 'next/image';

export type ProfileData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  // Extended — student / teacher only
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  className?: string | null;
};

const ROLE_CONFIG: Record<string, { label: string; gradient: string; badge: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    gradient: 'from-violet-600 via-purple-500 to-indigo-500',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  ADMIN: {
    label: 'Admin',
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  TEACHER: {
    label: 'Teacher',
    gradient: 'from-emerald-600 via-green-500 to-teal-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  STUDENT: {
    label: 'Student',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  USER: {
    label: 'User',
    gradient: 'from-slate-500 via-slate-400 to-gray-500',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
};

const INPUT_CLASS =
  'w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
  span = 1,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  span?: number;
}) {
  return (
    <div
      className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg)]"
      style={{ gridColumn: `span ${span}` }}
    >
      <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-[var(--text)] break-words">{value}</span>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? '••••••••'}
        autoComplete={autoComplete}
        className={`${INPUT_CLASS} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
        tabIndex={-1}
      >
        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
  );
}

function Card({
  icon,
  title,
  delay = 0,
  children,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  delay?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 flex flex-col gap-5"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
          {icon}
        </div>
        <h2 className="font-semibold text-[var(--text)]">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
      {footer && <div className="mt-auto pt-2">{footer}</div>}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage({ profile }: { profile: ProfileData }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const displayImage = avatarPreview || profile.imageUrl;
  const roleConfig = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.USER;
  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const hasExtended = profile.dob || profile.gender || profile.address || profile.className;

  // ── Handlers ──

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      let imageUrlToSave = profile.imageUrl;

      // If a new avatar was selected, upload it to Cloudinary first
      if (avatarBase64) {
        const uploadRes = await fetch('/api/profile/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: avatarBase64 }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          toast.error(uploadData.error || 'Failed to upload image');
          setIsSavingProfile(false);
          return;
        }

        imageUrlToSave = uploadData.url;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          imageUrl: imageUrlToSave,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to update profile'); return; }
      toast.success('Profile updated successfully!');
      setAvatarBase64(null);
      if (avatarPreview && imageUrlToSave) {
        // Clear preview; the page will typically be refreshed or re-fetched
        setAvatarPreview(null);
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) { toast.error('Please enter your current password'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }

    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to update password'); return; }
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Render ──

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-10">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden shadow-sm border border-[var(--border)]"
      >
        {/* Gradient banner */}
        <div className={`h-28 bg-gradient-to-r ${roleConfig.gradient} relative`}>
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="bg-[var(--surface)] px-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="relative w-24 aspect-square rounded-2xl border-4 border-[var(--surface)] overflow-hidden bg-gradient-to-br from-[var(--primary)] to-purple-400 flex items-center justify-center shadow-lg">
                {displayImage ? (
                  <Image src={displayImage} alt={name} fill className="object-cover" sizes="96px" />
                ) : (
                  <span className="text-white text-2xl font-bold select-none">
                    {getInitials(name || 'U')}
                  </span>
                )}
              </div>
              {/* Upload overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FiCamera size={20} className="text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-[var(--text)]">{name || '—'}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleConfig.badge}`}>
                    {roleConfig.label}
                  </span>
                  {profile.isEmailVerified && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <FiCheck size={11} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted)] mt-0.5">
                  {profile.email} · Joined {joinedDate}
                </p>
              </div>

              {/* Quick avatar change hint */}
              {avatarPreview && (
                <span className="text-xs text-[var(--primary)] flex items-center gap-1">
                  <FiEdit2 size={11} /> New photo selected — save to apply
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Two Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Personal Info */}
        <Card
          icon={<FiUser size={17} />}
          title="Personal Information"
          delay={0.1}
          footer={
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--primary)] text-white font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          }
        >
          <Field label="Full Name" icon={<FiUser size={13} />}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Email Address" icon={<FiMail size={13} />}>
            <input
              value={profile.email}
              disabled
              className={`${INPUT_CLASS} opacity-60 cursor-not-allowed`}
            />
          </Field>

          <Field label="Phone Number" icon={<FiPhone size={13} />}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={INPUT_CLASS}
              placeholder="+1 234 567 890"
            />
          </Field>
        </Card>

        {/* Change Password */}
        <Card
          icon={<FiLock size={17} />}
          title="Change Password"
          delay={0.2}
          footer={
            <button
              onClick={handleChangePassword}
              disabled={isSavingPassword}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--primary)] text-white font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          }
        >
          <Field label="Current Password" icon={<FiLock size={13} />}>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="off"
            />
          </Field>

          <Field label="New Password" icon={<FiShield size={13} />}>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>

          <Field label="Confirm New Password" icon={<FiShield size={13} />}>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
        </Card>
      </div>

      {/* ── Extended Info (student / teacher) ── */}
      {hasExtended && (
        <Card
          icon={<FiCalendar size={17} />}
          title="Additional Information"
          delay={0.3}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {profile.dob && (
              <InfoChip
                icon={<FiCalendar size={13} />}
                label="Date of Birth"
                value={new Date(profile.dob).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              />
            )}
            {profile.gender && (
              <InfoChip icon={<FiUser size={13} />} label="Gender" value={profile.gender} />
            )}
            {profile.className && (
              <InfoChip icon={<FiShield size={13} />} label="Class" value={profile.className} />
            )}
            {profile.address && (
              <InfoChip
                icon={<FiMapPin size={13} />}
                label="Address"
                value={profile.address}
                span={4}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
