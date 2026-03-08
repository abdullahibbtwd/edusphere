"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import {
  FiPlus, FiTrash2, FiEdit2, FiSave, FiX,
  FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiCheck, FiAlertCircle,
} from "react-icons/fi";

type AssessmentComponent = {
  id: string;
  name: string;
  maxScore: number;
  order: number;
};

type ResultSettings = {
  id: string;
  promotionAverage: number;
  publishedTermId: string | null;
  publishedTerm?: { id: string; name: string; session: { id: string; name: string } } | null;
};

type AcademicTerm = {
  id: string;
  name: string;
  isActive: boolean;
  session: { id: string; name: string };
};

type Student = { id: string; firstName: string; lastName: string; registrationNumber: string | null };
type Subject = { id: string; name: string; code: string };

type ResultScore = {
  id: string;
  componentId: string;
  score: number;
  component: AssessmentComponent;
};

type Result = {
  id: string;
  studentId: string;
  subjectId: string;
  student: Student;
  subject: Subject;
  term: { id: string; name: string; session: { id: string; name: string } };
  scores: ResultScore[];
};

type Class = { id: string; name: string; levelId: string; level?: { name: string } };

// ─── Grade Helper ─────────────────────────────────────────────────────────────

function getGrade(pct: number) {
  if (pct >= 70) return { letter: "A", color: "bg-green-100 text-green-700" };
  if (pct >= 60) return { letter: "B", color: "bg-blue-100 text-blue-700" };
  if (pct >= 50) return { letter: "C", color: "bg-yellow-100 text-yellow-700" };
  if (pct >= 45) return { letter: "D", color: "bg-orange-100 text-orange-700" };
  if (pct >= 40) return { letter: "E", color: "bg-red-100 text-red-600" };
  return { letter: "F", color: "bg-red-200 text-red-800" };
}

function computeTotal(scores: ResultScore[]) {
  return scores.reduce((s, r) => s + r.score, 0);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const params = useParams();
  const schoolId = params.school as string;
  const { role } = useUser();

  if (role === "admin") return <AdminResultsView schoolId={schoolId} />;
  if (role === "teacher") return <TeacherResultsView schoolId={schoolId} />;
  if (role === "student") return <StudentResultsView schoolId={schoolId} />;
  return <div className="p-6 text-muted">Loading…</div>;
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN VIEW
// ══════════════════════════════════════════════════════════════════════════════

function AdminResultsView({ schoolId }: { schoolId: string }) {
  const [tab, setTab] = useState<"results" | "config" | "settings">("results");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Results Management</h1>
        <div className="flex gap-2">
          {(["results", "config", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t ? "bg-primary text-white" : "bg-surface border border-border text-foreground hover:bg-muted"
              }`}
            >
              {t === "results" ? "All Results" : t === "config" ? "Assessment Config" : "Settings"}
            </button>
          ))}
        </div>
      </div>

      {tab === "config" && <AssessmentConfigPanel schoolId={schoolId} />}
      {tab === "settings" && <ResultSettingsPanel schoolId={schoolId} />}
      {tab === "results" && <AdminResultsTable schoolId={schoolId} />}
    </div>
  );
}

// ─── Assessment Component Config Panel ────────────────────────────────────────

function AssessmentConfigPanel({ schoolId }: { schoolId: string }) {
  const [components, setComponents] = useState<AssessmentComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newMax, setNewMax] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editMax, setEditMax] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/schools/${schoolId}/assessment-config`);
    const data = await res.json();
    setComponents(data.components || []);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const totalMax = components.reduce((s, c) => s + c.maxScore, 0);

  async function addComponent() {
    if (!newName.trim() || !newMax) return;
    setSaving(true);
    const res = await fetch(`/api/schools/${schoolId}/assessment-config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), maxScore: parseFloat(newMax) }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to add component"); setSaving(false); return; }
    toast.success("Component added");
    setNewName(""); setNewMax("");
    setSaving(false);
    load();
  }

  async function saveEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/api/schools/${schoolId}/assessment-config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName, maxScore: parseFloat(editMax) }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to update"); setSaving(false); return; }
    toast.success("Updated");
    setEditId(null);
    setSaving(false);
    load();
  }

  async function deleteComponent(id: string) {
    if (!confirm("Delete this component? All existing scores for it will also be removed.")) return;
    const res = await fetch(`/api/schools/${schoolId}/assessment-config?id=${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">Assessment Components</h2>
        <p className="text-sm text-muted-foreground">
          Configure what teachers fill in for each student (e.g. CA, Exam, Attendance).
          The total of all max scores becomes 100% for grading.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground animate-pulse">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Component</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Max Score</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">% of Total</th>
                <th className="py-2 px-3" />
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-2 px-3">
                    {editId === c.id ? (
                      <input
                        className="border border-border rounded px-2 py-1 text-sm w-full bg-background"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      <span className="font-medium">{c.name}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {editId === c.id ? (
                      <input
                        type="number"
                        className="border border-border rounded px-2 py-1 text-sm w-20 text-center bg-background"
                        value={editMax}
                        onChange={(e) => setEditMax(e.target.value)}
                        min={1}
                      />
                    ) : (
                      c.maxScore
                    )}
                  </td>
                  <td className="py-2 px-3 text-center text-muted-foreground">
                    {totalMax > 0 ? ((c.maxScore / totalMax) * 100).toFixed(1) + "%" : "—"}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2 justify-end">
                      {editId === c.id ? (
                        <>
                          <button onClick={() => saveEdit(c.id)} disabled={saving} className="text-primary hover:opacity-80">
                            <FiSave size={15} />
                          </button>
                          <button onClick={() => setEditId(null)} className="text-muted-foreground hover:opacity-80">
                            <FiX size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(c.id); setEditName(c.name); setEditMax(String(c.maxScore)); }} className="text-muted-foreground hover:text-primary">
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={() => deleteComponent(c.id)} className="text-muted-foreground hover:text-red-500">
                            <FiTrash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {/* Add row */}
              <tr>
                <td className="py-2 px-3">
                  <input
                    className="border border-border rounded px-2 py-1 text-sm w-full bg-background"
                    placeholder="e.g. CA"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addComponent()}
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    className="border border-border rounded px-2 py-1 text-sm w-20 text-center bg-background"
                    placeholder="20"
                    value={newMax}
                    onChange={(e) => setNewMax(e.target.value)}
                    min={1}
                    onKeyDown={(e) => e.key === "Enter" && addComponent()}
                  />
                </td>
                <td />
                <td className="py-2 px-3">
                  <button
                    onClick={addComponent}
                    disabled={saving || !newName.trim() || !newMax}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded text-sm disabled:opacity-50"
                  >
                    <FiPlus size={14} /> Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {totalMax > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium pt-1 border-t border-border">
          <span className="text-muted-foreground">Total max score:</span>
          <span className={totalMax === 100 ? "text-green-600" : "text-orange-500"}>
            {totalMax} {totalMax !== 100 && "(not 100 — grades are computed as percentage of total)"}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Result Settings Panel ─────────────────────────────────────────────────────

function ResultSettingsPanel({ schoolId }: { schoolId: string }) {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [promotionAvg, setPromotionAvg] = useState("50");
  const [publishedTermId, setPublishedTermId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [sRes, tRes] = await Promise.all([
      fetch(`/api/schools/${schoolId}/result-settings`),
      fetch(`/api/schools/${schoolId}/academic-calendar`),
    ]);
    const sData = await sRes.json();
    const tData = await tRes.json();

    if (sData.settings) {
      setPromotionAvg(String(sData.settings.promotionAverage));
      setPublishedTermId(sData.settings.publishedTermId || "");
    }

    // Flatten all terms from all sessions
    const allTerms: AcademicTerm[] = [];
    for (const session of tData.sessions || []) {
      for (const term of session.terms || []) {
        allTerms.push({ ...term, session: { id: session.id, name: session.name } });
      }
    }
    setTerms(allTerms);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/schools/${schoolId}/result-settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promotionAverage: parseFloat(promotionAvg),
        publishedTermId: publishedTermId || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to save"); setSaving(false); return; }
    toast.success("Settings saved");
    setSaving(false);
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading…</div>;

  const published = terms.find((t) => t.id === publishedTermId);

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Result Settings</h2>
        <p className="text-sm text-muted-foreground">
          Control result visibility and set the promotion threshold.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Promotion Average */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Promotion Average (%)</label>
          <p className="text-xs text-muted-foreground">
            Students need to achieve this average (across all subjects) to be promoted to the next level.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={promotionAvg}
              onChange={(e) => setPromotionAvg(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 w-28 text-sm bg-background"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        {/* Publish Results */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Published Term (visible to students)</label>
          <p className="text-xs text-muted-foreground">
            Students can only view results for the published term. Set to none to hide all results.
          </p>
          <select
            value={publishedTermId}
            onChange={(e) => setPublishedTermId(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm w-full bg-background"
          >
            <option value="">— None (results hidden from students) —</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.session.name} — {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status badge */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
        publishedTermId ? "bg-green-50 text-green-700 border border-green-200" : "bg-muted text-muted-foreground border border-border"
      }`}>
        {publishedTermId ? <FiEye size={15} /> : <FiEyeOff size={15} />}
        {publishedTermId
          ? `Results are open — students can view ${published ? `${published.session.name} ${published.name}` : "selected term"} results`
          : "Results are closed — students cannot see any results"}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
      >
        <FiSave size={14} />
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}

// ─── Admin Results Table ───────────────────────────────────────────────────────

function AdminResultsTable({ schoolId }: { schoolId: string }) {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [classSubjects, setClassSubjects] = useState<Subject[]>([]);
  const [components, setComponents] = useState<AssessmentComponent[]>([]);
  const [settings, setSettings] = useState<ResultSettings | null>(null);

  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    async function loadFilters() {
      const [tRes, cRes, compRes, settRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}/academic-calendar`),
        fetch(`/api/schools/${schoolId}/classes`),
        fetch(`/api/schools/${schoolId}/assessment-config`),
        fetch(`/api/schools/${schoolId}/result-settings`),
      ]);
      const tData = await tRes.json();
      const cData = await cRes.json();
      const compData = await compRes.json();
      const settData = await settRes.json();

      const allTerms: AcademicTerm[] = [];
      for (const session of tData.sessions || []) {
        for (const term of session.terms || []) {
          allTerms.push({ ...term, session: { id: session.id, name: session.name } });
        }
      }
      setTerms(allTerms);
      setClasses(cData.classes || []);
      setComponents(compData.components || []);
      setSettings(settData.settings || null);

      const activeTerm = allTerms.find((t) => t.isActive);
      if (activeTerm) setSelectedTermId(activeTerm.id);
    }
    loadFilters();
  }, [schoolId]);

  const loadResults = useCallback(async () => {
    if (!selectedTermId || !selectedClassId) {
      setResults([]); setClassStudents([]); setClassSubjects([]);
      return;
    }
    setLoading(true);
    const url = new URL(`/api/schools/${schoolId}/results`, window.location.origin);
    url.searchParams.set("termId", selectedTermId);
    url.searchParams.set("classId", selectedClassId);
    const res = await fetch(url.toString());
    const data = await res.json();
    setResults(data.results || []);
    setClassStudents(data.classStudents || []);
    setClassSubjects(data.classSubjects || []);
    setLoading(false);
  }, [schoolId, selectedTermId, selectedClassId]);

  useEffect(() => { loadResults(); }, [loadResults]);

  const totalMax = components.reduce((s, c) => s + c.maxScore, 0);

  // Build a lookup: resultsByStudentAndSubject[studentId][subjectId] = Result
  const resultLookup = results.reduce((acc, r) => {
    if (!acc[r.studentId]) acc[r.studentId] = {};
    acc[r.studentId][r.subjectId] = r;
    return acc;
  }, {} as Record<string, Record<string, Result>>);

  // Compute per-student summary across ALL class subjects (pending = 0)
  function studentSummary(studentId: string) {
    const subjectCount = classSubjects.length;
    if (subjectCount === 0) return { avgPct: 0, recordedCount: 0 };
    let total = 0;
    let recordedCount = 0;
    for (const subj of classSubjects) {
      const r = resultLookup[studentId]?.[subj.id];
      if (r) { total += totalMax > 0 ? (computeTotal(r.scores) / totalMax) * 100 : 0; recordedCount++; }
    }
    return { avgPct: total / subjectCount, recordedCount };
  }

  const needsClassSelection = !selectedClassId;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedTermId}
          onChange={(e) => setSelectedTermId(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
        >
          <option value="">Select Term</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.session.name} — {t.name}
            </option>
          ))}
        </select>
        <select
          value={selectedClassId}
          onChange={(e) => { setSelectedClassId(e.target.value); setExpandedStudent(null); }}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
        >
          <option value="">— Select a class —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {needsClassSelection ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
          Select a class to view results
        </div>
      ) : !selectedTermId ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
          Select a term to view results
        </div>
      ) : loading ? (
        <div className="text-sm text-muted-foreground animate-pulse p-4">Loading results…</div>
      ) : classStudents.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
          No students found in this class.
        </div>
      ) : (
        <>
          {/* Class summary bar */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
            <span><strong className="text-foreground">{classStudents.length}</strong> students</span>
            <span>·</span>
            <span><strong className="text-foreground">{classSubjects.length}</strong> subjects</span>
            {classSubjects.length === 0 && (
              <span className="text-orange-500 font-medium">
                No subjects assigned to this class yet — teachers need to be assigned to subjects first.
              </span>
            )}
          </div>

          <div className="space-y-2">
            {classStudents.map((student) => {
              const { avgPct, recordedCount } = studentSummary(student.id);
              const grade = getGrade(avgPct);
              const promoted = settings ? avgPct >= settings.promotionAverage : null;
              const isOpen = expandedStudent === student.id;

              return (
                <div key={student.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors text-left"
                    onClick={() => setExpandedStudent(isOpen ? null : student.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{student.firstName} {student.lastName}</span>
                      {student.registrationNumber && (
                        <span className="ml-2 text-xs text-muted-foreground">#{student.registrationNumber}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {recordedCount}/{classSubjects.length} recorded
                    </span>
                    <span className="text-sm font-medium">{avgPct.toFixed(1)}%</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${grade.color}`}>{grade.letter}</span>
                    {promoted !== null && (
                      <span className={`flex items-center gap-1 text-xs font-medium ${promoted ? "text-green-600" : "text-red-500"}`}>
                        {promoted ? <FiCheck size={13} /> : <FiAlertCircle size={13} />}
                        {promoted ? "Promoted" : "Not promoted"}
                      </span>
                    )}
                    {isOpen ? <FiChevronUp size={16} className="text-muted-foreground" /> : <FiChevronDown size={16} className="text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead className="bg-primary text-white">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold">Subject</th>
                            {components.map((c) => (
                              <th key={c.id} className="px-3 py-2 text-center font-semibold whitespace-nowrap">
                                {c.name}<br />
                                <span className="font-normal text-xs opacity-80">/{c.maxScore}</span>
                              </th>
                            ))}
                            <th className="px-3 py-2 text-center font-semibold">Total</th>
                            <th className="px-3 py-2 text-center font-semibold">%</th>
                            <th className="px-3 py-2 text-center font-semibold">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classSubjects.map((subj) => {
                            const r = resultLookup[student.id]?.[subj.id];
                            const isPending = !r;
                            const total = r ? computeTotal(r.scores) : 0;
                            const pct = r && totalMax > 0 ? (total / totalMax) * 100 : 0;
                            const g = getGrade(pct);
                            return (
                              <tr key={subj.id} className={`border-b border-border ${isPending ? "opacity-50" : "hover:bg-muted/20"}`}>
                                <td className="px-4 py-2 font-medium">
                                  {subj.name}
                                  {isPending && (
                                    <span className="ml-2 text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">Pending</span>
                                  )}
                                </td>
                                {components.map((c) => {
                                  const sc = r?.scores.find((s) => s.componentId === c.id);
                                  return (
                                    <td key={c.id} className="px-3 py-2 text-center">
                                      {sc ? sc.score : <span className="text-muted-foreground">—</span>}
                                    </td>
                                  );
                                })}
                                <td className="px-3 py-2 text-center font-medium">{isPending ? "—" : total}</td>
                                <td className="px-3 py-2 text-center">{isPending ? "—" : `${pct.toFixed(1)}%`}</td>
                                <td className="px-3 py-2 text-center">
                                  {isPending ? (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  ) : (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${g.color}`}>{g.letter}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEACHER VIEW
// ══════════════════════════════════════════════════════════════════════════════

type TaughtClass = {
  id: string;
  name: string;
  levelName: string;
  subjects: Subject[];   // subjects THIS teacher teaches in this class
  students: Student[];
  isSupervised: boolean;
};

function TeacherResultsView({ schoolId }: { schoolId: string }) {
  const { user } = useUser();
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [taughtClasses, setTaughtClasses] = useState<TaughtClass[]>([]);
  const [components, setComponents] = useState<AssessmentComponent[]>([]);

  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // "overview" = supervisor sees all subjects/students; "entry" = entering marks for one subject
  const [viewMode, setViewMode] = useState<"overview" | "entry">("entry");
  const [entrySubjectId, setEntrySubjectId] = useState("");

  // Overview mode state
  const [classSubjects, setClassSubjects] = useState<Subject[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [overviewResults, setOverviewResults] = useState<Result[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Entry mode state
  const [entryStudents, setEntryStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [entryLoading, setEntryLoading] = useState(false);

  // Load teacher's class assignments and components
  useEffect(() => {
    if (!user?.userId) return;
    async function init() {
      const [compRes, calRes, classRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}/assessment-config`),
        fetch(`/api/schools/${schoolId}/academic-calendar`),
        fetch(`/api/schools/${schoolId}/teachers/${user!.userId}/my-classes?byUserId=true`),
      ]);
      const compData = await compRes.json();
      const calData = await calRes.json();
      const classData = await classRes.json();

      setComponents(compData.components || []);

      const allTerms: AcademicTerm[] = [];
      for (const session of calData.sessions || []) {
        for (const term of session.terms || []) {
          allTerms.push({ ...term, session: { id: session.id, name: session.name } });
        }
      }
      setTerms(allTerms);
      const active = allTerms.find((t) => t.isActive);
      if (active) { setSelectedTermId(active.id); setSelectedSessionId(active.session.id); }

      const taught: TaughtClass[] = classData.taughtClasses || [];
      const supervisedOnly: TaughtClass[] = (classData.supervisedOnlyClasses || []).map((c: TaughtClass) => ({
        ...c, isSupervised: true, subjects: c.subjects || [],
      }));
      setTaughtClasses([...taught, ...supervisedOnly]);
    }
    init();
  }, [schoolId, user?.userId, user]);

  // When class changes, decide which mode to start in
  useEffect(() => {
    if (!selectedClassId) return;
    const cls = taughtClasses.find((c) => c.id === selectedClassId);
    if (cls?.isSupervised) {
      setViewMode("overview");
      setEntrySubjectId("");
    } else {
      setViewMode("entry");
    }
    setExpandedStudent(null);
    setScores({});
  }, [selectedClassId, taughtClasses]);

  // Load overview data (all results + all students + all subjects)
  useEffect(() => {
    if (viewMode !== "overview" || !selectedTermId || !selectedClassId) return;
    setOverviewLoading(true);
    fetch(`/api/schools/${schoolId}/results?termId=${selectedTermId}&classId=${selectedClassId}`)
      .then((r) => r.json())
      .then((d) => {
        setOverviewResults(d.results || []);
        setClassStudents(d.classStudents || []);
        setClassSubjects(d.classSubjects || []);
        setOverviewLoading(false);
      });
  }, [schoolId, selectedTermId, selectedClassId, viewMode]);

  // Load entry data for a specific subject
  useEffect(() => {
    if (!entrySubjectId || !selectedTermId || !selectedClassId) return;
    setEntryLoading(true);

    // Students come from the class (use classStudents if in overview→entry, or load fresh)
    const cls = taughtClasses.find((c) => c.id === selectedClassId);
    const baseStudents = classStudents.length > 0 ? classStudents : (cls?.students as Student[] || []);
    setEntryStudents(baseStudents);

    fetch(
      `/api/schools/${schoolId}/results?termId=${selectedTermId}&classId=${selectedClassId}&subjectId=${entrySubjectId}`
    )
      .then((r) => r.json())
      .then((d) => {
        const init: Record<string, Record<string, string>> = {};
        for (const r of d.results || []) {
          init[r.studentId] = {};
          for (const s of r.scores) {
            init[r.studentId][s.componentId] = String(s.score);
          }
        }
        setScores(init);
        setEntryLoading(false);
      });
  }, [schoolId, selectedTermId, selectedClassId, entrySubjectId, taughtClasses, classStudents]);

  function setScore(studentId: string, componentId: string, value: string) {
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [componentId]: value },
    }));
  }

  async function saveAll() {
    if (!selectedTermId || !selectedSessionId || !selectedClassId || !entrySubjectId) {
      toast.error("Missing required selection");
      return;
    }
    setSaving(true);
    const entries = entryStudents.map((student) => ({
      studentId: student.id,
      subjectId: entrySubjectId,
      scores: components.map((c) => ({
        componentId: c.id,
        score: parseFloat(scores[student.id]?.[c.id] || "0") || 0,
      })),
    }));

    const res = await fetch(`/api/schools/${schoolId}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ termId: selectedTermId, sessionId: selectedSessionId, classId: selectedClassId, entries }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to save"); setSaving(false); return; }
    toast.success("Results saved successfully");
    setSaving(false);

    // Refresh overview data if we came from supervisor view
    const cls = taughtClasses.find((c) => c.id === selectedClassId);
    if (cls?.isSupervised) {
      setOverviewLoading(true);
      fetch(`/api/schools/${schoolId}/results?termId=${selectedTermId}&classId=${selectedClassId}`)
        .then((r) => r.json())
        .then((d) => {
          setOverviewResults(d.results || []);
          setClassStudents(d.classStudents || []);
          setClassSubjects(d.classSubjects || []);
          setOverviewLoading(false);
        });
    }
  }

  const totalMax = components.reduce((s, c) => s + c.maxScore, 0);
  const selectedClass = taughtClasses.find((c) => c.id === selectedClassId);
  // Subjects that this teacher can edit in the selected class
  const teacherSubjectIds = new Set(selectedClass?.subjects.map((s) => s.id) || []);
  // For entry mode in non-supervised classes, the available subjects are those the teacher teaches
  const entrySubjectOptions = selectedClass?.subjects || [];

  // Overview result lookup: resultLookup[studentId][subjectId] = Result
  const resultLookup = overviewResults.reduce((acc, r) => {
    if (!acc[r.studentId]) acc[r.studentId] = {};
    acc[r.studentId][r.subjectId] = r;
    return acc;
  }, {} as Record<string, Record<string, Result>>);

  function studentAvg(studentId: string) {
    if (classSubjects.length === 0) return 0;
    const total = classSubjects.reduce((s, subj) => {
      const r = resultLookup[studentId]?.[subj.id];
      return s + (r && totalMax > 0 ? (computeTotal(r.scores) / totalMax) * 100 : 0);
    }, 0);
    return total / classSubjects.length;
  }

  // ── Top selectors (always visible) ────────────────────────────────────────
  const topBar = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Term</label>
        <select
          value={selectedTermId}
          onChange={(e) => {
            setSelectedTermId(e.target.value);
            const t = terms.find((t) => t.id === e.target.value);
            if (t) setSelectedSessionId(t.session.id);
          }}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface"
        >
          <option value="">Select term</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>{t.session.name} — {t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Class</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface"
        >
          <option value="">Select class</option>
          {taughtClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.isSupervised ? " ★ Supervisor" : ""}
            </option>
          ))}
        </select>
      </div>
      {/* In entry mode for non-supervised class: show subject selector inline */}
      {viewMode === "entry" && !selectedClass?.isSupervised && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
          <select
            value={entrySubjectId}
            onChange={(e) => setEntrySubjectId(e.target.value)}
            disabled={!selectedClassId}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface disabled:opacity-50"
          >
            <option value="">Select subject</option>
            {entrySubjectOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // ── OVERVIEW MODE (supervisor) ─────────────────────────────────────────────
  if (viewMode === "overview" && selectedClass?.isSupervised) {
    const entrySubject = classSubjects.find((s) => s.id === entrySubjectId);

    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {entrySubjectId ? `Entering Marks — ${entrySubject?.name}` : `Class Overview — ${selectedClass.name}`}
            </h1>
            {!entrySubjectId && (
              <p className="text-sm text-muted-foreground mt-0.5">
                You are the class supervisor. You can view all subjects and enter marks for your own.
              </p>
            )}
          </div>
          {entrySubjectId && (
            <button
              onClick={() => { setEntrySubjectId(""); setScores({}); }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5"
            >
              <FiX size={14} /> Back to Overview
            </button>
          )}
        </div>

        {topBar}

        {components.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">
            No assessment components configured yet. Ask your admin to set them up first.
          </div>
        )}

        {/* ── Entry sub-view (supervisor entering their subject's marks) ── */}
        {entrySubjectId ? (
          <>
            {entryLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading…</div>
            ) : entryStudents.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
                No students in this class.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Student</th>
                        {components.map((c) => (
                          <th key={c.id} className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                            {c.name}<br /><span className="font-normal text-xs opacity-80">max {c.maxScore}</span>
                          </th>
                        ))}
                        <th className="px-3 py-3 text-center font-semibold">Total /{totalMax}</th>
                        <th className="px-3 py-3 text-center font-semibold">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entryStudents.map((student) => {
                        const studentScores = scores[student.id] || {};
                        const total = components.reduce((s, c) => s + (parseFloat(studentScores[c.id] || "0") || 0), 0);
                        const pct = totalMax > 0 ? (total / totalMax) * 100 : 0;
                        const g = getGrade(pct);
                        return (
                          <tr key={student.id} className="border-b border-border hover:bg-muted/20">
                            <td className="px-4 py-2 font-medium">
                              {student.firstName} {student.lastName}
                              {student.registrationNumber && <span className="ml-1.5 text-xs text-muted-foreground">#{student.registrationNumber}</span>}
                            </td>
                            {components.map((c) => (
                              <td key={c.id} className="px-2 py-2 text-center">
                                <input
                                  type="number" min={0} max={c.maxScore} step={0.5}
                                  value={studentScores[c.id] ?? ""}
                                  onChange={(e) => setScore(student.id, c.id, e.target.value)}
                                  className="w-16 border border-border rounded px-2 py-1 text-center text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </td>
                            ))}
                            <td className="px-3 py-2 text-center font-medium">{total.toFixed(1)}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${g.color}`}>{g.letter}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={saveAll}
                    disabled={saving || !selectedTermId || components.length === 0}
                    className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    <FiSave size={14} />{saving ? "Saving…" : "Save All Scores"}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          /* ── Full class overview table ── */
          <>
            {!selectedClassId || !selectedTermId ? (
              <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
                Select a term and class to view the class overview.
              </div>
            ) : overviewLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse p-4">Loading class data…</div>
            ) : classStudents.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
                No students found in this class.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                  <span><strong className="text-foreground">{classStudents.length}</strong> students</span>
                  <span>·</span>
                  <span><strong className="text-foreground">{classSubjects.length}</strong> subjects</span>
                  <span>·</span>
                  <span>
                    You can edit:{" "}
                    <strong className="text-foreground">
                      {classSubjects.filter((s) => teacherSubjectIds.has(s.id)).map((s) => s.name).join(", ") || "none"}
                    </strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {classStudents.map((student) => {
                    const avgPct = studentAvg(student.id);
                    const grade = getGrade(avgPct);
                    const isOpen = expandedStudent === student.id;
                    const recordedCount = classSubjects.filter((s) => !!resultLookup[student.id]?.[s.id]).length;

                    return (
                      <div key={student.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                        <button
                          className="w-full flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors text-left"
                          onClick={() => setExpandedStudent(isOpen ? null : student.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{student.firstName} {student.lastName}</span>
                            {student.registrationNumber && (
                              <span className="ml-2 text-xs text-muted-foreground">#{student.registrationNumber}</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{recordedCount}/{classSubjects.length} recorded</span>
                          <span className="text-sm font-medium">{avgPct.toFixed(1)}%</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${grade.color}`}>{grade.letter}</span>
                          {isOpen ? <FiChevronUp size={16} className="text-muted-foreground" /> : <FiChevronDown size={16} className="text-muted-foreground" />}
                        </button>

                        {isOpen && (
                          <div className="border-t border-border overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead className="bg-primary text-white">
                                <tr>
                                  <th className="px-4 py-2 text-left font-semibold">Subject</th>
                                  {components.map((c) => (
                                    <th key={c.id} className="px-3 py-2 text-center font-semibold whitespace-nowrap">
                                      {c.name}<br /><span className="font-normal text-xs opacity-80">/{c.maxScore}</span>
                                    </th>
                                  ))}
                                  <th className="px-3 py-2 text-center font-semibold">Total</th>
                                  <th className="px-3 py-2 text-center font-semibold">%</th>
                                  <th className="px-3 py-2 text-center font-semibold">Grade</th>
                                  <th className="px-3 py-2 text-center font-semibold">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {classSubjects.map((subj) => {
                                  const r = resultLookup[student.id]?.[subj.id];
                                  const isPending = !r;
                                  const canEdit = teacherSubjectIds.has(subj.id);
                                  const total = r ? computeTotal(r.scores) : 0;
                                  const pct = r && totalMax > 0 ? (total / totalMax) * 100 : 0;
                                  const g = getGrade(pct);
                                  return (
                                    <tr key={subj.id} className={`border-b border-border ${!canEdit && isPending ? "opacity-50" : "hover:bg-muted/20"}`}>
                                      <td className="px-4 py-2 font-medium">
                                        {subj.name}
                                        {canEdit && (
                                          <span className="ml-2 text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">Your subject</span>
                                        )}
                                        {!canEdit && isPending && (
                                          <span className="ml-2 text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">Pending</span>
                                        )}
                                      </td>
                                      {components.map((c) => {
                                        const sc = r?.scores.find((s) => s.componentId === c.id);
                                        return (
                                          <td key={c.id} className="px-3 py-2 text-center">
                                            {sc ? sc.score : <span className="text-muted-foreground">—</span>}
                                          </td>
                                        );
                                      })}
                                      <td className="px-3 py-2 text-center font-medium">{isPending ? "—" : total}</td>
                                      <td className="px-3 py-2 text-center">{isPending ? "—" : `${pct.toFixed(1)}%`}</td>
                                      <td className="px-3 py-2 text-center">
                                        {isPending ? <span className="text-muted-foreground text-xs">—</span> : (
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${g.color}`}>{g.letter}</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {canEdit && (
                                          <button
                                            onClick={() => {
                                              setEntrySubjectId(subj.id);
                                              setExpandedStudent(null);
                                            }}
                                            className="text-xs px-2.5 py-1 bg-primary text-white rounded hover:opacity-80 whitespace-nowrap"
                                          >
                                            {isPending ? "Enter Marks" : "Edit Marks"}
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  // ── ENTRY MODE (non-supervised class OR entering marks for a specific subject) ──
  const entrySubjectName = entrySubjectOptions.find((s) => s.id === entrySubjectId)?.name;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        {entrySubjectId ? `Enter Marks — ${entrySubjectName}` : "Enter Student Results"}
      </h1>

      {components.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">
          No assessment components configured yet. Ask your admin to set them up first.
        </div>
      )}

      {topBar}

      {/* Score table */}
      {selectedClassId && entrySubjectId && (
        entryLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading…</div>
        ) : entryStudents.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
            No students in this class.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Student</th>
                    {components.map((c) => (
                      <th key={c.id} className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                        {c.name}<br /><span className="font-normal text-xs opacity-80">max {c.maxScore}</span>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-semibold">Total /{totalMax}</th>
                    <th className="px-3 py-3 text-center font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {entryStudents.map((student) => {
                    const studentScores = scores[student.id] || {};
                    const total = components.reduce((s, c) => s + (parseFloat(studentScores[c.id] || "0") || 0), 0);
                    const pct = totalMax > 0 ? (total / totalMax) * 100 : 0;
                    const g = getGrade(pct);
                    return (
                      <tr key={student.id} className="border-b border-border hover:bg-muted/20">
                        <td className="px-4 py-2 font-medium">
                          {student.firstName} {student.lastName}
                          {student.registrationNumber && <span className="ml-1.5 text-xs text-muted-foreground">#{student.registrationNumber}</span>}
                        </td>
                        {components.map((c) => (
                          <td key={c.id} className="px-2 py-2 text-center">
                            <input
                              type="number" min={0} max={c.maxScore} step={0.5}
                              value={studentScores[c.id] ?? ""}
                              onChange={(e) => setScore(student.id, c.id, e.target.value)}
                              className="w-16 border border-border rounded px-2 py-1 text-center text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                        ))}
                        <td className="px-3 py-2 text-center font-medium">{total.toFixed(1)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${g.color}`}>{g.letter}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                onClick={saveAll}
                disabled={saving || !selectedTermId || !selectedClassId || !entrySubjectId || components.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                <FiSave size={14} />{saving ? "Saving…" : "Save All Scores"}
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT VIEW
// ══════════════════════════════════════════════════════════════════════════════

type StudentResult = {
  id: string;
  subject: Subject;
  term: { id: string; name: string; session: { id: string; name: string } } | null;
  scores: ResultScore[];
  totalScore: number;
  percentage: number;
  grade: string;
  isPending: boolean;
};

type StudentSummary = {
  studentName: string;
  overallAverage: number;
  overallGrade: string;
  promotionAverage: number;
  isPromoted: boolean;
  subjectCount: number;
  recordedCount: number;
};

function StudentResultsView({ schoolId }: { schoolId: string }) {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [components, setComponents] = useState<AssessmentComponent[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [myRes, compRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}/results/my`),
        fetch(`/api/schools/${schoolId}/assessment-config`),
      ]);
      const myData = await myRes.json();
      const compData = await compRes.json();

      setIsPublished(myData.isPublished || false);
      setMessage(myData.message || "");
      setResults(myData.results || []);
      setSummary(myData.summary || null);
      setComponents(compData.components || []);
      setLoading(false);
    }
    load();
  }, [schoolId]);

  const totalMax = components.reduce((s, c) => s + c.maxScore, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <FiEyeOff size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Results Not Available</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {message || "Your results haven't been published yet. Check back later."}
        </p>
      </div>
    );
  }

  const grade = summary ? getGrade(summary.overallAverage) : null;
  const recordedResults = results.filter((r) => !r.isPending);
  const pendingResults = results.filter((r) => r.isPending);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Results</h1>

      {/* Summary card */}
      {summary && (
        <div className="bg-surface border border-border rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Overall Average</div>
            <div className="text-2xl font-bold">{summary.overallAverage}%</div>
            <div className="text-xs text-muted-foreground mt-0.5">across all subjects</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Grade</div>
            <div className={`text-2xl font-bold ${grade?.color.split(" ")[1] || ""}`}>{summary.overallGrade}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Subjects</div>
            <div className="text-2xl font-bold">{summary.subjectCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{summary.recordedCount} recorded</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Promotion Status</div>
            <div className={`flex items-center justify-center gap-1.5 font-semibold ${summary.isPromoted ? "text-green-600" : "text-red-500"}`}>
              {summary.isPromoted ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
              {summary.isPromoted ? "Promoted" : "Not Promoted"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">min: {summary.promotionAverage}%</div>
          </div>
        </div>
      )}

      {/* Recorded results */}
      {recordedResults.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">Recorded Subjects</h2>
          {recordedResults.map((r) => {
            const isOpen = expandedSubject === r.id;
            const g = getGrade(r.percentage);
            return (
              <div key={r.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors text-left"
                  onClick={() => setExpandedSubject(isOpen ? null : r.id)}
                >
                  <div className="flex-1 font-medium">{r.subject.name}</div>
                  <span className="text-sm text-muted-foreground">{r.totalScore}/{totalMax}</span>
                  <span className="text-sm font-medium">{r.percentage}%</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${g.color}`}>{r.grade}</span>
                  {isOpen ? <FiChevronUp size={16} className="text-muted-foreground" /> : <FiChevronDown size={16} className="text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="border-t border-border px-5 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {r.scores.map((s) => (
                        <div key={s.id} className="bg-muted/40 rounded-lg p-3 text-center">
                          <div className="text-xs text-muted-foreground mb-1">{s.component.name}</div>
                          <div className="text-lg font-bold">{s.score}</div>
                          <div className="text-xs text-muted-foreground">/ {s.component.maxScore}</div>
                        </div>
                      ))}
                      <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
                        <div className="text-xs text-muted-foreground mb-1">Total</div>
                        <div className="text-lg font-bold text-primary">{r.totalScore}</div>
                        <div className="text-xs text-muted-foreground">/ {totalMax}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pending subjects */}
      {pendingResults.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Pending Subjects ({pendingResults.length})
          </h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {pendingResults.map((r, i) => (
                  <tr key={r.id} className={`px-4 py-3 flex items-center justify-between ${i < pendingResults.length - 1 ? "border-b border-border" : ""}`}>
                    <td className="px-4 py-2.5 font-medium flex-1">{r.subject.name}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">
                        Not recorded yet
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
          No subjects found for your class. Please contact your school administrator.
        </div>
      )}
    </div>
  );
}
