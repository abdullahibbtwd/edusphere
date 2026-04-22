/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
    Wallet,
    Bell,
    Settings2,
    Loader2,
    Download,
    FileText,
    AlertCircle,
    Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/CustomSelect";
import FeeStructureModal from "@/components/FeeStructureModal";
import { useUser } from "@/context/UserContext";

interface Session {
    id: string;
    name: string;
    isActive: boolean;
}

interface Level {
    id: string;
    name: string;
}

interface FeeStructure {
    classId: string;
    class: {
        levelId: string;
        level: {
            id: string;
            name: string;
        };
    };
    term: string;
    amount: number;
}

// Student view: my payments and receipt download
interface MyPaymentFee {
    id: string;
    sessionId: string;
    sessionName: string;
    sessionActive: boolean;
    term: string;
    totalAmount: number;
    amountPaid: number;
    balance: number;
    status: string;
    payments: { id: string; amount: number; paymentDate: string; method: string | null; reference: string | null }[];
}

interface CurrentSessionSummary {
    sessionId: string | null;
    sessionName: string | null;
    currentTerm: string | null;
    totalDue: number;
    amountPaidForSession: number;
    balance: number;
    isSessionPaid: boolean;
    feeForCurrentTerm: number;
}

function StudentFeesView({ schoolId }: { schoolId: string }) {
    const [data, setData] = useState<{
        student: { name: string; className?: string; levelName?: string };
        fees: MyPaymentFee[];
        currentSessionSummary?: CurrentSessionSummary | null;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    const fetchMyPayments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/schools/${schoolId}/fees/my-payments`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to load your payments");
                return;
            }
            const json = await res.json();
            setData({
                student: json.student,
                fees: json.fees || [],
                currentSessionSummary: json.currentSessionSummary ?? null
            });
        } catch {
            toast.error("Failed to load your payments");
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchMyPayments();
    }, [fetchMyPayments]);

    const handleDownloadReceipt = async (sessionId: string, term: string) => {
        setDownloading(`${sessionId}-${term}`);
        try {
            const res = await fetch(
                `/api/schools/${schoolId}/fees/receipt?sessionId=${encodeURIComponent(sessionId)}&term=${encodeURIComponent(term)}`
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Could not load receipt");
                return;
            }
            const { receipt } = await res.json();
            const win = window.open("", "_blank");
            if (!win) {
                toast.error("Please allow popups to download receipt");
                return;
            }
            const termLabel = (term || "").replace(/_/g, " ");
            win.document.write(`
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Receipt - ${receipt.sessionName} ${termLabel}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #f1f5f9;
    color: #1e293b;
  }
  @media print {
    body { background: #fff; padding: 0; display: block; }
    .receipt { box-shadow: none; border: 1px solid #e2e8f0; }
  }
  .receipt {
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    overflow: hidden;
    text-align: center;
  }
  .receipt-header {
    padding: 28px 24px 20px;
    border-bottom: 2px dashed #e2e8f0;
  }
  .receipt-school {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.02em;
    margin: 0 0 4px 0;
  }
  .receipt-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    margin: 0 0 8px 0;
  }
  .receipt-meta {
    font-size: 12px;
    color: #64748b;
    margin: 0;
  }
  .receipt-body {
    padding: 24px;
    text-align: left;
  }
  .receipt-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }
  .receipt-row:last-of-type { border-bottom: none; }
  .receipt-row .label { color: #64748b; font-weight: 500; }
  .receipt-row .value { font-weight: 600; color: #1e293b; text-align: right; }
  .receipt-row.highlight .value { font-size: 20px; font-weight: 700; color: #059669; }
  .receipt-status {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .receipt-status.paid { background: #d1fae5; color: #065f46; }
  .receipt-status.partial { background: #fef3c7; color: #92400e; }
  .receipt-status.unpaid { background: #fee2e2; color: #991b1b; }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #64748b;
    margin: 20px 0 12px 0;
    padding-bottom: 6px;
  }
  .payments-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .payments-table th {
    text-align: left;
    padding: 10px 8px;
    font-weight: 600;
    color: #64748b;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;
  }
  .payments-table th:nth-child(2) { text-align: right; }
  .payments-table td {
    padding: 10px 8px;
    border-bottom: 1px solid #f1f5f9;
  }
  .payments-table td:nth-child(2) { text-align: right; font-weight: 600; color: #059669; }
  .receipt-footer {
    padding: 20px 24px 28px;
    border-top: 2px dashed #e2e8f0;
    font-size: 11px;
    color: #94a3b8;
    text-align: center;
    line-height: 1.5;
  }
</style></head><body>
  <div class="receipt">
    <div class="receipt-header">
      <h1 class="receipt-school">${(receipt.schoolName || "").replace(/</g, "&lt;")}</h1>
      <p class="receipt-title">Fee Payment Receipt</p>
      <p class="receipt-meta">${(receipt.sessionName || "").replace(/</g, "&lt;")} · ${termLabel} Term</p>
    </div>
    <div class="receipt-body">
      <div class="receipt-row">
        <span class="label">Student</span>
        <span class="value">${(receipt.studentName || "").replace(/</g, "&lt;")}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Total due</span>
        <span class="value">₦${Number(receipt.totalDue).toLocaleString()}</span>
      </div>
      <div class="receipt-row highlight">
        <span class="label">Total paid</span>
        <span class="value">₦${Number(receipt.totalPaid).toLocaleString()}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Balance</span>
        <span class="value">₦${Number((receipt.totalDue || 0) - (receipt.totalPaid || 0)).toLocaleString()}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Status</span>
        <span class="value"><span class="receipt-status ${(receipt.status || "").toLowerCase()}">${(receipt.status || "").replace(/_/g, " ")}</span></span>
      </div>
      <p class="section-title">Payment history</p>
      <table class="payments-table">
        <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead>
        <tbody>
          ${(receipt.payments || []).map((p: { paymentDate: string; amount: number; method: string; reference: string }) =>
            `<tr><td>${new Date(p.paymentDate).toLocaleDateString()}</td><td>₦${Number(p.amount).toLocaleString()}</td><td>${(p.method || "-").replace(/</g, "&lt;")}</td><td>${(p.reference || "-").replace(/</g, "&lt;")}</td></tr>`
          ).join("")}
        </tbody>
      </table>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body></html>`);
            win.document.close();
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return (
            <div className="h-48 sm:h-64 flex flex-col items-center justify-center gap-3 sm:gap-4 text-muted-foreground px-3">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500" />
                <p className="font-semibold sm:font-black uppercase tracking-wider text-xs">Loading your fees...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card text-center text-muted-foreground">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-60" />
                <p className="text-sm sm:text-base">Unable to load your payment information.</p>
            </div>
        );
    }

    const { student, fees, currentSessionSummary } = data;
    const hasCurrentSession = currentSessionSummary?.sessionId != null;
    const totalDue = hasCurrentSession
        ? currentSessionSummary!.totalDue
        : fees.reduce((s, f) => s + f.totalAmount, 0);
    const totalPaid = hasCurrentSession
        ? currentSessionSummary!.amountPaidForSession
        : fees.reduce((s, f) => s + f.amountPaid, 0);
    const balance = hasCurrentSession
        ? currentSessionSummary!.balance
        : Math.max(0, totalDue - totalPaid);
    const hasUnpaid = hasCurrentSession
        ? !currentSessionSummary!.isSessionPaid && balance > 0
        : fees.some((f) => f.status === "UNPAID" || f.status === "PARTIAL");

    return (
        <div className="flex flex-col bg-surface p-4 sm:p-6 m-4 mt-0 flex-1 rounded-2xl shadow-sm gap-5 sm:gap-6 font-poppins text-text">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 bg-surface p-4 sm:p-6 md:p-8 rounded-xl shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-[0.03] pointer-events-none">
                    <Wallet size={120} className="sm:w-40 sm:h-40" />
                </div>
                <div className="space-y-1.5 sm:space-y-2 relative z-10">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold sm:font-black uppercase tracking-wider sm:tracking-widest text-blue-500">My Fees</span>
                    </div>
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-bold sm:font-black tracking-tight text-foreground uppercase">Fees &amp; Payments</h1>
                    <p className="text-sm sm:text-base text-muted-foreground font-normal sm:font-medium max-w-md">
                        View your payment status and download receipts for any session or term, whether you paid here or the school recorded it.
                    </p>
                    {student.className && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {student.name} · {student.levelName} - {student.className}
                        </p>
                    )}
                </div>
            </div>

            {/* Make payment CTA */}
            {hasUnpaid && (
                <div className="bg-amber-500/10 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-lg shrink-0">
                            <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold sm:font-bold text-foreground">Make a payment</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                You can pay at the school bursar&apos;s office or have the admin record your payment under this school. Receipts will appear here once recorded.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary: current session/term when available, else all fees */}
            {hasCurrentSession && currentSessionSummary?.sessionName && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                    {currentSessionSummary.sessionName}
                    {currentSessionSummary.currentTerm && (
                        <> · <span className="capitalize">{currentSessionSummary.currentTerm.replace(/_/g, " ")}</span> term</>
                    )}
                    {currentSessionSummary.isSessionPaid && (
                        <span className="ml-1.5 text-emerald-600 font-medium">(Session paid)</span>
                    )}
                </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-surface rounded-xl p-3 sm:p-4 shadow-sm">
                    <p className="text-[10px] sm:text-xs font-medium sm:font-bold uppercase tracking-wider text-muted-foreground">
                        {hasCurrentSession ? "Due (this period)" : "Total due"}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-bold sm:font-black text-foreground mt-0.5">₦{totalDue.toLocaleString()}</p>
                </div>
                <div className="bg-surface rounded-xl p-3 sm:p-4 shadow-sm">
                    <p className="text-[10px] sm:text-xs font-medium sm:font-bold uppercase tracking-wider text-muted-foreground">
                        {hasCurrentSession ? "Paid (this session)" : "Total paid"}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-bold sm:font-black text-emerald-600 mt-0.5">₦{totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-surface rounded-xl p-3 sm:p-4 shadow-sm">
                    <p className="text-[10px] sm:text-xs font-medium sm:font-bold uppercase tracking-wider text-muted-foreground">Balance</p>
                    <p className={`text-base sm:text-lg md:text-xl font-bold sm:font-black mt-0.5 ${balance > 0 ? "text-amber-600" : "text-foreground"}`}>
                        ₦{balance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* By session / term */}
            <div className="space-y-3 sm:space-y-4">
                <h2 className="text-sm sm:text-base md:text-lg font-bold sm:font-black uppercase tracking-tight">By session &amp; term</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {fees.map((f) => {
                        const termLabel = (f.term || "").replace(/_/g, " ");
                        const canDownload = f.amountPaid > 0;
                        const isDownloading = downloading === `${f.sessionId}-${f.term}`;
                        return (
                            <div
                                key={f.id}
                                className="bg-surface rounded-xl p-4 sm:p-5 shadow-sm flex flex-col gap-3 sm:gap-4"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm sm:text-base font-semibold sm:font-bold text-foreground truncate">{f.sessionName} {f.sessionActive ? "(Active)" : ""}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">{termLabel}</p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold sm:font-bold uppercase shrink-0 ${
                                            f.status === "PAID"
                                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                                : f.status === "PARTIAL"
                                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                                : "bg-red-500/20 text-red-700 dark:text-red-400"
                                        }`}
                                    >
                                        {f.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Due</p>
                                        <p className="font-semibold">₦{f.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Paid</p>
                                        <p className="font-semibold text-emerald-600">₦{f.amountPaid.toLocaleString()}</p>
                                    </div>
                                </div>
                                {canDownload && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2 text-xs sm:text-sm h-8 sm:h-9"
                                        onClick={() => handleDownloadReceipt(f.sessionId, f.term)}
                                        disabled={!!isDownloading}
                                    >
                                        {isDownloading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                        Download receipt
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
                {fees.length === 0 && (
                    <div className="bg-muted/10 rounded-xl p-6 sm:p-8 text-center text-muted-foreground">
                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-60" />
                        <p className="text-sm sm:text-base">No fee records for you yet. Fees are added when the school sets up the structure for your class.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FeeManagementPage() {
    const params = useParams();
    const schoolId = params.school as string;
    const { role, loading: userLoading } = useUser();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState("");
    const [levels, setLevels] = useState<Level[]>([]);
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifying, setNotifying] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLevelIds, setModalLevelIds] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [sessRes, lvlRes, feeRes] = await Promise.all([
                fetch(`/api/schools/${schoolId}/academic-calendar`),
                fetch(`/api/schools/${schoolId}/levels`),
                fetch(`/api/schools/${schoolId}/fees/structures${selectedSession ? `?sessionId=${selectedSession}` : ''}`)
            ]);

            if (sessRes.ok) {
                const data = await sessRes.json();
                const sortedSessions = data.sessions || [];
                setSessions(sortedSessions);
                if (!selectedSession && sortedSessions.length > 0) {
                    const active = sortedSessions.find((s: Session) => s.isActive);
                    setSelectedSession(active?.id || sortedSessions[0].id);
                }
            }
            if (lvlRes.ok) setLevels((await lvlRes.json()).levels || []);
            if (feeRes.ok) setFeeStructures((await feeRes.json()).structures || []);
        } catch {
            toast.error("Failed to load fee configuration");
        } finally {
            setLoading(false);
        }
    }, [schoolId, selectedSession]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (!userLoading && role === "student") {
        return <StudentFeesView schoolId={schoolId} />;
    }

    const getFeesForLevel = (levelId: string) => {
        // Find fee structures that belong to classes in this level
        // In our case, the API structures include the class -> level relation
        return feeStructures.filter(fs => (fs as any).class?.levelId === levelId);
    };

    // Smart logic to group levels by their fee amount
    const getFeeTiers = () => {
        const tiers: Record<number, { levels: Level[], amount: number }> = {};

        levels.forEach(level => {
            const levelFees = getFeesForLevel(level.id);
            const amount = levelFees.find(f => f.term === "FIRST")?.amount || 0;

            if (!tiers[amount]) {
                tiers[amount] = { levels: [], amount };
            }
            tiers[amount].levels.push(level);
        });

        // Convert to sorted array (highest price first, or configured vs not)
        return Object.values(tiers).sort((a, b) => b.amount - a.amount);
    };

    const handleNotifyUnpaid = async (term: string) => {
        if (!confirm(`This will send automated email reminders to all students and parents with outstanding fees for ${term.replace('_', ' ')}. Proceed?`)) return;

        try {
            setNotifying(true);
            const response = await fetch(`/api/schools/${schoolId}/fees/notifications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: selectedSession,
                    term
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(data.message || "Notifications sent successfully!");
            } else {
                toast.error(data.error || "Failed to send notifications");
            }
        } catch {
            toast.error("An error occurred while sending notifications");
        } finally {
            setNotifying(false);
        }
    };

    const configuredCount = levels.filter(l => {
        const fees = getFeesForLevel(l.id);
        return fees.length > 0 && fees.some((f: FeeStructure) => f.amount > 0);
    }).length;
    const pendingCount = levels.filter(l => {
        const fees = getFeesForLevel(l.id);
        return fees.length === 0 || fees.every((f: FeeStructure) => f.amount === 0);
    }).length;

    return (
        <div className="flex flex-col bg-surface p-4 sm:p-6 m-4 mt-0 flex-1 rounded-2xl shadow-sm gap-4 sm:gap-6 font-poppins text-text">
            {/* Header: compact */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                        <Wallet className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-tight">Fee Management</h1>
                        <p className="text-xs text-muted-foreground truncate sm:max-w-md">
                            Configure fee structures by session and level.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <CustomSelect
                        value={selectedSession}
                        onChange={setSelectedSession}
                        className="w-full sm:w-[220px]"
                        options={sessions.map((s) => ({
                            value: s.id,
                            label: `${s.name}${s.isActive ? " (Active)" : ""}`,
                        }))}
                        placeholder="Session"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold"
                        onClick={() => handleNotifyUnpaid("FIRST")}
                        disabled={notifying || loading}
                    >
                        {notifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                        Notify Unpaid
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <p className="text-xs font-medium uppercase tracking-wider">Loading...</p>
                </div>
            ) : (
                <>
                    {/* Action bar + stats: one row */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 p-3 sm:p-4 bg-surface rounded-xl shadow-sm flex-1 sm:max-w-sm">
                            <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                                <Settings2 className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-bold text-foreground">Setup Fee Structure</h2>
                                <p className="text-[11px] text-muted-foreground">Set term amounts per level for this session.</p>
                            </div>
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5"
                                onClick={() => { setModalLevelIds([]); setIsModalOpen(true); }}
                            >
                                <Settings2 className="w-3.5 h-3.5" />
                                Configure
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="flex flex-col p-3 rounded-xl bg-muted/20">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Levels</span>
                                <span className="text-lg font-bold text-foreground mt-0.5">{levels.length}</span>
                            </div>
                            <div className="flex flex-col p-3 rounded-xl bg-emerald-500/5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Configured</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{configuredCount}</span>
                            </div>
                            <div className="flex flex-col p-3 rounded-xl bg-amber-500/5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Pending</span>
                                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fee Tiers: compact cards */}
                    {levels.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fee tiers by level</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {getFeeTiers().map((tier, idx) => {
                                    const isConfigured = tier.amount > 0;
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-xl shadow-sm flex flex-col gap-3 ${isConfigured ? "bg-surface" : "bg-muted/10"}`}
                                        >
                                            <div className="flex flex-wrap gap-1.5">
                                                {tier.levels.map(l => (
                                                    <span key={l.id} className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                        {l.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-baseline justify-between gap-2">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Per term</p>
                                                    <p className="text-base font-bold text-foreground">₦{tier.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-muted-foreground">₦{(tier.amount * 3).toLocaleString()}/yr</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-[10px] font-semibold gap-1.5 shrink-0"
                                                    onClick={() => { setModalLevelIds(tier.levels.map(l => l.id)); setIsModalOpen(true); }}
                                                >
                                                    <Settings2 className="w-3 h-3" />
                                                    {isConfigured ? "Edit" : "Set"}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            <FeeStructureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schoolId={schoolId}
                sessionId={selectedSession}
                sessionName={sessions.find(s => s.id === selectedSession)?.name || ""}
                availableLevels={levels}
                currentFees={feeStructures}
                initialSelectedLevelIds={modalLevelIds}
                onSuccess={fetchData}
            />
        </div>
    );
}
