'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

export type SelectOption = { value: string; label: string };

type CustomSelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** `inline`: options stack below the trigger and grow the parent (no inner scroll). */
  menuVariant?: 'dropdown' | 'inline';
};

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  menuVariant = 'dropdown',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const isInline = menuVariant === 'inline';

  return (
    <div ref={ref} className={`relative w-56 ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        aria-disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:border-[var(--primary)]'
        }`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-text"
        >
          <FiChevronDown size={16} />
        </motion.span>
      </button>

      {/* Dropdown / inline list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: isInline ? 0 : -6, scale: isInline ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isInline ? 0 : -6, scale: isInline ? 1 : 0.97 }}
            transition={{ duration: 0.15 }}
            className={
              isInline
                ? 'relative z-10 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden'
                : 'absolute z-50 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden'
            }
          >
            <ul className={isInline ? 'py-1' : 'max-h-56 overflow-y-auto py-1'}>
              {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors
                      ${isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text)] hover:bg-[var(--primary)]/10'
                      }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isActive && <FiCheck size={14} className="flex-shrink-0" />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
