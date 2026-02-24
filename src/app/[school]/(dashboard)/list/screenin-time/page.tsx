"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  MapPin,
  Users,
  Clock,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue?: string;
  maxCapacity: number;
  bookingCount: number;
}

export default function ScreeningPage() {
  const params = useParams();
  const schoolId = params.school as string;

  const [isEnabled, setIsEnabled] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Single-slot form
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    maxCapacity: 50,
  });
  const [addingSlot, setAddingSlot] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [toggleRes, slotsRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}/screening`),
        fetch(`/api/schools/${schoolId}/screening/slots`),
      ]);
      if (toggleRes.ok) {
        const t = await toggleRes.json();
        setIsEnabled(t.isScreeningEnabled ?? false);
      }
      if (slotsRes.ok) {
        const { slots: s } = await slotsRes.json();
        setSlots(s || []);
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async () => {
    const next = !isEnabled;
    setToggling(true);
    setIsEnabled(next);
    await fetch(`/api/schools/${schoolId}/screening`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isScreeningEnabled: next }),
    });
    setToggling(false);
  };

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSlot(true);
    const res = await fetch(`/api/schools/${schoolId}/screening/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ date: "", startTime: "", endTime: "", venue: "", maxCapacity: 50 });
      fetchData();
    }
    setAddingSlot(false);
  };

  const deleteSlot = async (slotId: string) => {
    await fetch(`/api/schools/${schoolId}/screening/slots?slotId=${slotId}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls = "w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelCls = "block text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1.5";

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Screening</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage applicant screening sessions.</p>
          </div>
        </div>

        {/* Toggle card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/60 backdrop-blur border border-border/60 rounded-3xl p-7 shadow-xl flex items-center justify-between"
        >
          <div>
            <h2 className="text-lg font-black">Enable Screening</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEnabled
                ? "Screening is active. New applicants are auto-assigned to available slots."
                : "Turn on to require applicants to attend a screening session."}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`transition-all duration-300 ${isEnabled ? "text-primary" : "text-muted-foreground"} ${toggling ? "opacity-50" : ""}`}
          >
            {isEnabled
              ? <ToggleRight className="w-14 h-14 stroke-[1.5]" />
              : <ToggleLeft className="w-14 h-14 stroke-[1.5]" />}
          </button>
        </motion.div>

        {/* Slot management - visible only when enabled */}
        <AnimatePresence>
          {isEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6"
            >
              {/* Add Slot form - 2 cols */}
              <div className="lg:col-span-2 bg-surface/60 backdrop-blur border border-border/60 rounded-3xl p-6 shadow-lg">
                <h3 className="font-black text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Add Screening Slot
                </h3>
                <form onSubmit={addSlot} className="space-y-4">
                  <div>
                    <label className={labelCls}><CalendarClock className="inline w-3 h-3 mr-1 mb-0.5" />Date</label>
                    <input type="date" required className={inputCls}
                      value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}><Clock className="inline w-3 h-3 mr-1 mb-0.5" />Start Time</label>
                      <input type="time" required className={inputCls}
                        value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}><Clock className="inline w-3 h-3 mr-1 mb-0.5" />End Time</label>
                      <input type="time" className={inputCls}
                        value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}><MapPin className="inline w-3 h-3 mr-1 mb-0.5" />Venue</label>
                    <input type="text" placeholder="e.g. Main Hall" className={inputCls}
                      value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
                  </div>

                  <div>
                    <label className={labelCls}><Users className="inline w-3 h-3 mr-1 mb-0.5" />Max Slots / Day</label>
                    <input type="number" min={1} required className={inputCls}
                      value={form.maxCapacity}
                      onChange={e => setForm(f => ({ ...f, maxCapacity: Number(e.target.value) }))} />
                  </div>

                  <button type="submit" disabled={addingSlot}
                    className="w-full py-3 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-primary/20">
                    {addingSlot ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Slot
                  </button>
                </form>
              </div>

              {/* Slots table - 3 cols */}
              <div className="lg:col-span-3 bg-surface/60 backdrop-blur border border-border/60 rounded-3xl overflow-hidden shadow-lg">
                <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase tracking-wider">Screening Slots</h3>
                  <span className="text-[10px] bg-primary/10 text-primary font-black px-3 py-1 rounded-full tracking-wider">
                    {slots.length} TOTAL
                  </span>
                </div>

                {slots.length === 0 ? (
                  <div className="py-20 text-center">
                    <CalendarClock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">No slots yet.</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Add one using the form.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/40">
                          <th className="px-5 py-3 text-left">Date</th>
                          <th className="px-5 py-3 text-left">Time</th>
                          <th className="px-5 py-3 text-left">Venue</th>
                          <th className="px-5 py-3 text-left">Booked</th>
                          <th className="px-5 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {slots.map((slot, i) => {
                          const isFull = slot.bookingCount >= slot.maxCapacity;
                          const pct = Math.min(Math.round((slot.bookingCount / slot.maxCapacity) * 100), 100);
                          return (
                            <tr key={slot.id} className={i % 2 === 0 ? "bg-background/30" : ""}>
                              <td className="px-5 py-3.5 font-bold text-xs">
                                {new Date(slot.date + "T00:00:00").toLocaleDateString(undefined, {
                                  weekday: "short", month: "short", day: "numeric"
                                })}
                              </td>
                              <td className="px-5 py-3.5 text-muted-foreground text-xs">
                                {slot.startTime}{slot.endTime ? ` – ${slot.endTime}` : ""}
                              </td>
                              <td className="px-5 py-3.5 text-muted-foreground text-xs">
                                {slot.venue || "-"}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-muted rounded-full h-1">
                                    <div className={`h-1 rounded-full ${isFull ? "bg-red-500" : "bg-primary"}`}
                                      style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className={`text-[10px] font-black ${isFull ? "text-red-500" : "text-foreground"}`}>
                                    {slot.bookingCount}/{slot.maxCapacity}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button onClick={() => deleteSlot(slot.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}