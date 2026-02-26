/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CreditCardIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { Info } from "lucide-react";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    levelName: string;
    className: string;
    classId: string;
}

interface RecordPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    schoolId: string;
}

export default function RecordPaymentDialog({
    isOpen,
    onClose,
    student,
    schoolId
}: RecordPaymentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const [feeStructures, setFeeStructures] = useState<any[]>([]);
    const [paidTerms, setPaidTerms] = useState<string[]>([]);
    const [fullSessionPaid, setFullSessionPaid] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);

    const [formData, setFormData] = useState({
        sessionId: "",
        term: "FIRST",
        amount: "",
        method: "CASH"
    });

    useEffect(() => {
        if (isOpen) {
            fetchSessions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && formData.sessionId) {
            fetchFeeStructures();
        }
    }, [isOpen, formData.sessionId]);

    useEffect(() => {
        if (isOpen && formData.sessionId && student.id) {
            fetchStudentSessionStatus();
        } else {
            setPaidTerms([]);
            setFullSessionPaid(false);
        }
    }, [isOpen, formData.sessionId, student.id]);

    const fetchStudentSessionStatus = async () => {
        try {
            setLoadingStatus(true);
            const res = await fetch(
                `/api/schools/${schoolId}/fees/student-session-status?studentId=${encodeURIComponent(student.id)}&sessionId=${encodeURIComponent(formData.sessionId)}`
            );
            if (res.ok) {
                const data = await res.json();
                const pTerms = data.paidTerms ?? [];
                const fPaid = !!data.fullSessionPaid;
                setPaidTerms(pTerms);
                setFullSessionPaid(fPaid);
                const currentPaid = fPaid || pTerms.includes(formData.term);
                if (currentPaid) {
                    const unpaid = ["FIRST", "SECOND", "THIRD"].filter((t) => !pTerms.includes(t));
                    if (!fPaid) unpaid.push("FULL_SESSION");
                    setFormData((prev) => ({ ...prev, term: unpaid[0] || prev.term }));
                }
            } else {
                setPaidTerms([]);
                setFullSessionPaid(false);
            }
        } catch {
            setPaidTerms([]);
            setFullSessionPaid(false);
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        // Calculate amount based on term and structures
        if (feeStructures.length > 0) {
            if (formData.term === "FULL_SESSION") {
                const total = feeStructures.reduce((acc, curr) => acc + curr.amount, 0);
                setFormData(prev => ({ ...prev, amount: total.toString() }));
            } else {
                const structure = feeStructures.find(s => s.term === formData.term);
                setFormData(prev => ({ ...prev, amount: structure?.amount.toString() || "" }));
            }
        } else {
            setFormData(prev => ({ ...prev, amount: "" }));
        }
    }, [formData.term, feeStructures]);

    const fetchSessions = async () => {
        try {
            const response = await fetch(`/api/schools/${schoolId}/academic-calendar`);
            const data = await response.json();
            if (response.ok) {
                setSessions(data.sessions || []);
                if (data.sessions?.length > 0) {
                    const active = data.sessions.find((s: any) => s.isActive);
                    setFormData(prev => ({ ...prev, sessionId: active?.id || data.sessions[0].id }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        }
    };

    const fetchFeeStructures = async () => {
        try {
            const response = await fetch(`/api/schools/${schoolId}/fees/structures?sessionId=${formData.sessionId}&classId=${student.classId}`);
            const data = await response.json();
            if (response.ok) {
                setFeeStructures(data.structures || []);
            }
        } catch (error) {
            console.error("Failed to fetch fee structures:", error);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!formData.sessionId || !formData.amount) {
                toast.error("Fee amount not configured for this selection");
                return;
            }

            setLoading(true);

            // Auto-generate professional reference
            const session = sessions.find(s => s.id === formData.sessionId);
            const sessionName = session?.name.replace(/\s+/g, '') || "FEE";
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
            const finalReference = `${sessionName}-${dateStr}-${randomStr}`;

            const response = await fetch(`/api/schools/${schoolId}/fees/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: student.id,
                    sessionId: formData.sessionId,
                    term: formData.term,
                    amount: parseFloat(formData.amount),
                    method: formData.method,
                    reference: finalReference
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Payment of ₦${formData.amount} recorded successfully for ${student.firstName}!`);
                onClose();
            } else {
                toast.error(data.error || "Failed to record payment");
            }
        } catch (error) {
            toast.error("An error occurred while recording payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-bg">
                <DialogHeader>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                        <BanknotesIcon className="w-7 h-7 text-blue-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Record Fee Payment</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground">
                        Record a school fee payment for <span className="text-primary font-bold">{student.firstName} {student.lastName}</span> in <span className="text-foreground font-bold">{student.levelName} - {student.className}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Academic Session</Label>
                        <Select
                            value={formData.sessionId}
                            onValueChange={(val) => setFormData({ ...formData, sessionId: val })}
                        >
                            <SelectTrigger className="bg-bg text-text border-border font-bold">
                                <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                            <SelectContent className="bg-bg text-foreground border-border">
                                {sessions.map((s) => (
                                    <SelectItem key={s.id} value={s.id} className="font-bold">
                                        {s.name} {s.isActive ? "(Current)" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Term</Label>
                            {fullSessionPaid ? (
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                                    Full session already paid for this session — nothing to record.
                                </div>
                            ) : (
                                <Select
                                    value={formData.term}
                                    onValueChange={(val) => setFormData({ ...formData, term: val })}
                                    disabled={loadingStatus}
                                >
                                    <SelectTrigger className="bg-bg text-text border-border font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-bg text-text border-border">
                                        <SelectItem value="FIRST" className="font-bold" disabled={paidTerms.includes("FIRST")}>
                                            First Term {paidTerms.includes("FIRST") ? "(Paid)" : ""}
                                        </SelectItem>
                                        <SelectItem value="SECOND" className="font-bold" disabled={paidTerms.includes("SECOND")}>
                                            Second Term {paidTerms.includes("SECOND") ? "(Paid)" : ""}
                                        </SelectItem>
                                        <SelectItem value="THIRD" className="font-bold" disabled={paidTerms.includes("THIRD")}>
                                            Third Term {paidTerms.includes("THIRD") ? "(Paid)" : ""}
                                        </SelectItem>
                                        <SelectItem value="FULL_SESSION" className="font-bold text-primary" disabled={fullSessionPaid}>
                                            Full Session {fullSessionPaid ? "(Paid)" : ""}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-text">Payment Method</Label>
                            <Select
                                value={formData.method}
                                onValueChange={(val) => setFormData({ ...formData, method: val })}
                            >
                                <SelectTrigger className="bg-bg text-text border-border font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-bg text-text border-border">
                                    <SelectItem value="CASH" className="font-bold">Cash</SelectItem>
                                    <SelectItem value="BANK_TRANSFER" className="font-bold">Bank Transfer</SelectItem>
                                    <SelectItem value="ONLINE" className="font-bold">Online</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-text">Amount (₦)</Label>
                        <Input
                            id="amount"
                            type="text"
                            value={formData.amount ? new Intl.NumberFormat().format(parseFloat(formData.amount)) : "Not Configured"}
                            readOnly
                            className="bg-muted/30 text-text border-border font-black text-lg cursor-not-allowed"
                        />
                        {!formData.amount && (
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight flex items-center gap-1">
                                <Info className="w-3 h-3" /> No fee structure found for this term/session
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading} className="font-bold uppercase tracking-widest text-xs">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || fullSessionPaid}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs"
                    >
                        {loading ? "Recording..." : fullSessionPaid ? "Session paid" : "Record Payment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
