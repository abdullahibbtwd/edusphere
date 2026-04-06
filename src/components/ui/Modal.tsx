'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  panelClassName?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  panelClassName = '',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 cursor-default"
            onClick={onClose}
            aria-label="Close dialog"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className={`relative z-10 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-visible ${panelClassName}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 id="modal-title" className="text-lg font-semibold text-[var(--text)]">
                {title}
              </h2>
            </div>
            <div className="overflow-visible px-5 py-4">{children}</div>
            {footer != null && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] px-5 py-3 overflow-visible">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
