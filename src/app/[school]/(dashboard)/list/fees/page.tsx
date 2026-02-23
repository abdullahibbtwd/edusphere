"use client";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
    Wallet,
    Bell,
    Settings2,
    Loader2,
    ArrowRightLeft,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FeeStructureModal from "@/components/FeeStructureModal";

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

export default function FeeManagementPage() {
    const params = useParams();
    const schoolId = params.school as string;

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
        } catch (error) {
            console.error("Fetch failed", error);
            toast.error("Failed to load fee configuration");
        } finally {
            setLoading(false);
        }
    }, [schoolId, selectedSession]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        } catch (error) {
            toast.error("An error occurred while sending notifications");
        } finally {
            setNotifying(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card p-8 rounded-2xl border border-border shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Wallet size={160} />
                </div>

                <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Wallet className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-blue-500">Finance Control</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Fee Management</h1>
                    <p className="text-muted-foreground font-medium max-w-md">
                        Configure school fee structures and monitor outstanding balances across all academic levels.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 relative z-10">
                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                        <SelectTrigger className="w-[200px] h-12 bg-background border-border font-bold">
                            <SelectValue placeholder="Academic Session" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                            {sessions.map(s => (
                                <SelectItem key={s.id} value={s.id} className="font-bold">
                                    {s.name} {s.isActive ? "(Active)" : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-12 border-border font-black text-xs uppercase tracking-widest gap-2"
                            onClick={() => handleNotifyUnpaid("FIRST")}
                            disabled={notifying || loading}
                        >
                            {notifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                            Notify Unpaid
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {/* Main Content - Simplified Bulk Configuration View */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="font-black uppercase tracking-widest text-xs">Loading structure...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Primary Action Card */}
                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col items-center justify-center p-12 text-center space-y-6 group hover:border-blue-500/30 transition-all">
                            <div className="p-5 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <Settings2 className="w-12 h-12 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Setup Fee Structure</h2>
                                <p className="text-muted-foreground text-sm font-medium max-w-[300px]">
                                    Configure term amounts for all academic levels at once or select specific ones.
                                </p>
                            </div>
                            <Button
                                variant="default"
                                size="lg"
                                className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-lg shadow-blue-500/20"
                                onClick={() => {
                                    setModalLevelIds([]);
                                    setIsModalOpen(true);
                                }}
                            >
                                <Settings2 className="w-5 h-5" />
                                Configure Levels
                            </Button>
                        </div>

                        {/* Quick Summary Card */}
                        <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-black uppercase tracking-widest text-xs text-foreground">Current Status</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Levels</span>
                                    <span className="font-black text-lg">{levels.length}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Configured Fees</span>
                                    <span className="font-black text-lg text-emerald-500">
                                        {levels.filter(l => {
                                            const fees = getFeesForLevel(l.id);
                                            return fees.length > 0 && fees.some(f => f.amount > 0);
                                        }).length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                    <span className="text-xs font-bold text-amber-600/80 uppercase tracking-wider">Pending Setup</span>
                                    <span className="font-black text-lg text-amber-500">
                                        {levels.filter(l => {
                                            const fees = getFeesForLevel(l.id);
                                            return fees.length === 0 || fees.every(f => f.amount === 0);
                                        }).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Fee Tiers Section */}
                    {levels.length > 0 && (
                        <div className="mt-12 space-y-6">
                            <div className="flex items-center gap-2 px-2">
                                <h3 className="text-lg font-black uppercase tracking-tight">Configured Fee Tiers</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {getFeeTiers().map((tier, idx) => {
                                    const isConfigured = tier.amount > 0;
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-6 ${isConfigured
                                                ? "bg-card border-border hover:border-blue-500/30"
                                                : "bg-muted/10 border-dashed border-muted-foreground/20"
                                                }`}
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {tier.levels.map(l => (
                                                            <span key={l.id} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase">
                                                                {l.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount Per Term</p>
                                                    <p className="text-2xl font-black text-foreground">
                                                        ₦{tier.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                                        ₦{(tier.amount * 3).toLocaleString()} / YEAR
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full font-black uppercase tracking-widest text-[10px] h-10 gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                onClick={() => {
                                                    setModalLevelIds(tier.levels.map(l => l.id));
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                <Settings2 className="w-3.5 h-3.5" />
                                                {isConfigured ? "Update Tier" : "Configure Group"}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Quick Stats / Info */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-xs text-emerald-600 mb-1">Fee Activation</h3>
                        <p className="text-sm font-medium text-emerald-600/80 leading-snug">
                            Active fees are automatically applied to student dashboards once they register.
                        </p>
                    </div>
                </div>
                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-xs text-blue-600 mb-1">Automated Plan Detection</h3>
                        <p className="text-sm font-medium text-blue-600/80 leading-snug">
                            The system detects full session payments and adjusts student plans accordingly.
                        </p>
                    </div>
                </div>
                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Bell className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-xs text-amber-600 mb-1">Bursar Reminders</h3>
                        <p className="text-sm font-medium text-amber-600/80 leading-snug">
                            Unpaid fee notifications go to both the student's and parent's registered emails.
                        </p>
                    </div>
                </div>
            </div> */}

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
