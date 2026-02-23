"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    levelName: string;
    className: string;
}

interface StudentRegistrationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    schoolId: string;
    onSuccess: () => void;
}

export default function StudentRegistrationDialog({
    isOpen,
    onClose,
    student,
    schoolId,
    onSuccess
}: StudentRegistrationDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/schools/${schoolId}/students/${student.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isRegistered: true,
                    registrationNumber: undefined // Backend will auto-generate
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${student.firstName} has been registered successfully!`);
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || "Failed to register student");
            }
        } catch (error) {
            toast.error("An error occurred during registration");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-bg">
                <DialogHeader>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                        <CheckBadgeIcon className="w-7 h-7 text-green-500" />
                    </div>
                    <DialogTitle className="text-2xl text-text uppercase tracking-tight">Confirm Registration</DialogTitle>
                    <DialogDescription className="font-medium text-text">
                        You are about to officially register <span className="text-primary font-bold">{student.firstName} {student.lastName}</span> in <span className="font-bold text-foreground">{student.levelName} - {student.className}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <div className="p-4 bg-muted/20 rounded-xl border border-muted/30">
                        <p className="text-sm font-medium text-center text-muted-foreground">
                            An official registration number will be automatically generated, and a confirmation email will be sent to the student.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="font-bold uppercase tracking-widest text-[10px]">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRegister}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] px-8"
                    >
                        {loading ? "Registering..." : "Register Now"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
