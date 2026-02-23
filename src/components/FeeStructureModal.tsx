"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wallet, Info } from "lucide-react";

interface FeeStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolId: string;
    sessionId: string;
    sessionName: string;
    availableLevels: { id: string; name: string }[];
    currentFees: { term: string; amount: number; class?: { levelId: string } }[];
    initialSelectedLevelIds?: string[];
    onSuccess: () => void;
}

export default function FeeStructureModal({
    isOpen,
    onClose,
    schoolId,
    sessionId,
    sessionName,
    availableLevels,
    currentFees,
    initialSelectedLevelIds = [],
    onSuccess
}: FeeStructureModalProps) {
    const [loading, setLoading] = useState(false);

    // Core state in numbers
    const [termAmount, setTermAmount] = useState<number>(0);
    const [yearAmount, setYearAmount] = useState<number>(0);

    // Display state for formatting
    const [termInput, setTermInput] = useState("");
    const [yearInput, setYearInput] = useState("");

    const formatValue = (val: number) => {
        if (!val) return "";
        return new Intl.NumberFormat().format(val);
    };

    const parseValue = (val: string) => {
        return parseFloat(val.replace(/,/g, "")) || 0;
    };

    useEffect(() => {
        if (isOpen) {
            const initial = currentFees.find(f => f.term === "FIRST")?.amount ||
                currentFees.find(f => f.term === "SECOND")?.amount ||
                currentFees.find(f => f.term === "THIRD")?.amount || 0;
            setTermAmount(initial);
            setYearAmount(initial * 3);
            setTermInput(formatValue(initial));
            setYearInput(formatValue(initial * 3));
        }
    }, [isOpen, currentFees]);

    const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9.]/g, "");
        const num = parseFloat(raw) || 0;
        setTermAmount(num);
        setYearAmount(num * 3);
        setTermInput(raw ? formatValue(num) : "");
        setYearInput(raw ? formatValue(num * 3) : "");
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9.]/g, "");
        const num = parseFloat(raw) || 0;
        setYearAmount(num);
        setTermAmount(num / 3);
        setYearInput(raw ? formatValue(num) : "");
        setTermInput(raw ? formatValue(num / 3) : "");
    };

    const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);

    const handleToggleLevel = (id: string) => {
        setSelectedLevelIds((prev: string[]) =>
            prev.includes(id) ? prev.filter((l: string) => l !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedLevelIds.length === availableLevels.length) {
            setSelectedLevelIds([]);
        } else {
            setSelectedLevelIds(availableLevels.map(l => l.id));
        }
    };

    const handleSubmit = async () => {
        if (selectedLevelIds.length === 0) {
            toast.error("Please select at least one level");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`/api/schools/${schoolId}/fees/structures`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    levelIds: selectedLevelIds,
                    amount: termAmount
                })
            });

            if (response.ok) {
                toast.success(`Fees updated successfully for ${selectedLevelIds.length} levels`);
                onSuccess();
                onClose();
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to update fees");
            }
        } catch (error) {
            toast.error("An error occurred while updating fees");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-bg">
                <DialogHeader>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                        <Wallet className="w-7 h-7 text-blue-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Configure Fees</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground">
                        Bulk configure fee amounts for multiple levels for the <span className="text-foreground font-bold">{sessionName}</span> session.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    Select Levels
                                </Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] font-black uppercase tracking-tighter"
                                    onClick={handleSelectAll}
                                >
                                    {selectedLevelIds.length === availableLevels.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/20 rounded-xl border border-border max-h-[150px] overflow-y-auto">
                                {availableLevels.map(level => (
                                    <div
                                        key={level.id}
                                        onClick={() => handleToggleLevel(level.id)}
                                        className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1 ${selectedLevelIds.includes(level.id)
                                            ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                                            : "bg-background border-border text-muted-foreground hover:border-blue-500/20"
                                            }`}
                                    >
                                        <span className="text-[10px] font-black uppercase">{level.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="termAmount" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    Amount Per Term (₦)
                                </Label>
                                <Input
                                    id="termAmount"
                                    type="text"
                                    value={termInput}
                                    onChange={handleTermChange}
                                    placeholder="0"
                                    className="bg-bg text-text border-border font-black text-lg"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="yearAmount" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    Annual Total (₦)
                                </Label>
                                <Input
                                    id="yearAmount"
                                    type="text"
                                    value={yearInput}
                                    onChange={handleYearChange}
                                    placeholder="0"
                                    className="bg-bg text-text border-border font-black text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 flex gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-xs text-blue-500/80 leading-relaxed font-medium">
                            The calculated <span className="font-bold">Term Fee</span> will be applied to all three academic terms (First, Second, and Third) for the selected levels. This will apply to <span className="font-bold">{selectedLevelIds.length} levels</span> and their constituent classes.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="font-bold uppercase tracking-widest text-xs">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs"
                    >
                        {loading ? "Saving..." : "Save Configuration"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
