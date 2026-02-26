"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

type Level = { id: string; name: string };
type ClassItem = { id: string; name?: string; className?: string; levelId: string };

interface CreateStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  onSuccess: () => void;
}

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  classId: "",
  levelId: "",
  gender: "MALE",
  dob: "",
  address: "",
  paymentPlan: "TERM" as "TERM" | "SESSION",
};

export default function CreateStudentDialog({
  isOpen,
  onClose,
  schoolId,
  onSuccess,
}: CreateStudentDialogProps) {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const fetchLookups = useCallback(async () => {
    if (!schoolId) return;
    setLoadingLookups(true);
    try {
      const [clsRes, lvlRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}/classes`),
        fetch(`/api/schools/${schoolId}/levels`),
      ]);
      if (clsRes.ok) setClasses((await clsRes.json()).classes || []);
      if (lvlRes.ok) setLevels((await lvlRes.json()).levels || []);
    } catch (e) {
      console.error("Lookup fetch failed", e);
      toast.error("Failed to load levels and classes");
    } finally {
      setLoadingLookups(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (isOpen && schoolId) fetchLookups();
  }, [isOpen, schoolId, fetchLookups]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setStep("form");
      setOtpEmail("");
      setOtp(["", "", "", "", "", ""]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formData.levelId) setFormData((p) => ({ ...p, classId: "" }));
  }, [formData.levelId]);

  const classesForLevel = formData.levelId
    ? classes.filter((c) => c.levelId === formData.levelId)
    : [];

  const hasEmailOrPhone =
    (formData.email && formData.email.trim() !== "") ||
    (formData.phone && formData.phone.trim() !== "");

  const canSubmit =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    hasEmailOrPhone &&
    formData.classId !== "" &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (!hasEmailOrPhone) {
        toast.error("Please provide at least an email or a phone number.");
      } else if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
      } else if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
      } else {
        toast.error("Please fill all required fields.");
      }
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${schoolId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          password: formData.password,
          classId: formData.classId,
          gender: formData.gender,
          dob: formData.dob || undefined,
          address: formData.address.trim() || undefined,
          paymentPlan: formData.paymentPlan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requireOtp && formData.email.trim()) {
          toast.success("Student created. Please verify their email with the OTP sent.");
          setOtpEmail(formData.email.trim());
          setStep("otp");
        } else {
          toast.success("Student created. They can log in with phone or email and password.");
          onSuccess();
          onClose();
        }
      } else {
        toast.error(data.error || "Failed to create student");
      }
    } catch {
      toast.error("An error occurred while creating the student.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (el: HTMLInputElement, index: number) => {
    const v = el.value;
    if (isNaN(Number(v))) return;
    const next = [...otp];
    next[index] = v.slice(-1);
    setOtp(next);
    if (v && index < 5) (el.nextElementSibling as HTMLInputElement)?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      (e.currentTarget.previousElementSibling as HTMLInputElement)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const next = [...otp];
    pasted.split("").forEach((c, i) => { if (i < 6) next[i] = c; });
    setOtp(next);
    const inputs = e.currentTarget.querySelectorAll<HTMLInputElement>("input");
    if (inputs.length) inputs[Math.min(pasted.length, 5)].focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch(`/api/schools/${schoolId}/students/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp: code }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Email verified. Student can now log in.");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setResendingOtp(true);
    try {
      const res = await fetch(`/api/schools/${schoolId}/students/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP resent. Check the email.");
        setResendCooldown(60);
      } else {
        toast.error(data.error || "Failed to resend");
      }
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResendingOtp(false);
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-bg text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-text tracking-tight">
            {step === "otp" ? "Verify email" : "Add New Student"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {step === "otp"
              ? `Enter the 6-digit code sent to ${otpEmail}.`
              : "Create a new student with a login account. Use at least email or phone; if email is provided we'll verify it."}
          </DialogDescription>
        </DialogHeader>

        {step === "otp" ? (
          <div className="py-4">
            <div
              className="flex justify-center gap-2 mb-6"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-10 h-12 border border-border rounded-lg text-center text-xl font-bold bg-bg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={verifyingOtp}
                className="border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleResendOtp}
                disabled={resendingOtp || resendCooldown > 0}
                variant="outline"
                className="border-border text-foreground"
              >
                {resendingOtp ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </Button>
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {verifyingOtp ? "Verifying..." : "Verify"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
        <>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground">
                First name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First name"
                className="bg-bg border-border text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground">
                Last name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Last name"
                className="bg-bg border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="bg-bg border-border text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className="bg-bg border-border text-foreground"
              />
            </div>
          </div>
          {!hasEmailOrPhone && (formData.firstName || formData.lastName) && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              Provide at least an email or phone number.
            </p>
          )}

          <div className="space-y-2 border-t border-border pt-4">
            <Label className="text-xs font-semibold text-muted-foreground">Login account</Label>
            <p className="text-[11px] text-muted-foreground">
              Student can sign in with email or phone and the password below. If email is provided, we&apos;ll send a verification code.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="bg-bg border-border text-foreground pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground">
                  Confirm password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="bg-bg border-border text-foreground pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-[10px] text-red-500 font-medium">Passwords do not match.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">Level *</Label>
              <Select
                value={formData.levelId || "__none__"}
                onValueChange={(v) =>
                  setFormData({ ...formData, levelId: v === "__none__" ? "" : v, classId: "" })
                }
                disabled={loadingLookups}
              >
                <SelectTrigger className="bg-bg text-foreground border-border">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-bg text-foreground border-border">
                  <SelectItem value="__none__">Select level</SelectItem>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">Class *</Label>
              <Select
                value={formData.classId || "__none__"}
                onValueChange={(v) =>
                  setFormData({ ...formData, classId: v === "__none__" ? "" : v })
                }
                disabled={!formData.levelId || loadingLookups}
              >
                <SelectTrigger className="bg-bg text-foreground border-border disabled:opacity-60">
                  <SelectValue placeholder={formData.levelId ? "Select class" : "Select level first"} />
                </SelectTrigger>
                <SelectContent className="bg-bg text-foreground border-border">
                  <SelectItem value="__none__">Select class</SelectItem>
                  {classesForLevel.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.className || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-muted-foreground">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData({ ...formData, gender: v })}
              >
                <SelectTrigger className="bg-bg text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg text-foreground border-border">
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob" className="text-xs font-semibold text-muted-foreground">
                Date of birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="bg-bg border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground">
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
              className="bg-bg border-border text-foreground"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-muted-foreground">Payment plan</Label>
            <Select
              value={formData.paymentPlan}
              onValueChange={(v) =>
                setFormData({ ...formData, paymentPlan: v as "TERM" | "SESSION" })
              }
            >
              <SelectTrigger className="bg-bg text-foreground border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg text-foreground border-border">
                <SelectItem value="TERM">Per Term</SelectItem>
                <SelectItem value="SESSION">Per Session</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-border text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creating..." : "Create Student"}
          </Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
