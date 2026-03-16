"use client"

import { useState } from 'react';
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AuthSystem = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const params = useParams();
  const schoolId = params.school as string;

  const [activeForm, setActiveForm] = useState<'login' | 'register' | 'forgot' | 'verify' | 'reset-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [resetEmail, setResetEmail] = useState(''); // Email for password reset
  const [verificationType, setVerificationType] = useState<'registration' | 'password-reset'>('registration'); // Track verification purpose
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const [showResetConfirmPass, setShowResetConfirmPass] = useState(false);

  const handleVerificationInput = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus to next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`verification-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`verification-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - index);
    if (!pastedData) return;

    const newCode = [...verificationCode];
    pastedData.split('').forEach((digit, i) => {
      if (index + i < 6) newCode[index + i] = digit;
    });
    setVerificationCode(newCode);

    // Focus last filled input or next empty one
    const nextIndex = Math.min(index + pastedData.length, 5);
    const nextInput = document.getElementById(`verification-${nextIndex}`);
    if (nextInput) nextInput.focus();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          toast.error(data.error);
          setRegistrationEmail(email);
          setActiveForm('verify');
          return;
        }
        toast.error(data.error || 'Login failed');
        return;
      }

      // Block login if user belongs to a different school
      if (data.user.school?.subdomain && data.user.school.subdomain !== schoolId) {
        toast.error(
          `This account belongs to Another School. Please login through your school's portal.`,
          { duration: 5000 }
        );
        setTimeout(() => {
          window.location.href = `/${data.user.school.subdomain}/auth`;
        }, 2000);
        return;
      }

      toast.success('Login successful!');

      // Redirect to school dashboard
      window.location.href = `/${schoolId}`;

    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Default role to USER for applicants
        body: JSON.stringify({ name, email, password, role: 'USER' }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      toast.success(data.message);

      setRegistrationEmail(email);
      setActiveForm('verify');

      // Clear form except email (needed for verification)
      setName('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const code = verificationCode.join('');

    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      // For password reset verification, we verify the code first
      if (verificationType === 'password-reset') {
        const response = await fetch(`/api/schools/${schoolId}/auth/verify-reset-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: resetEmail,
            code
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Invalid code');
          return;
        }

        toast.success('Code verified! Please set your new password.');
        setActiveForm('reset-password');
        setIsLoading(false);
        return;
      }

      // For email verification (registration)
      const response = await fetch(`/api/schools/${schoolId}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registrationEmail || email,
          verificationCode: code
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Verification failed');
        return;
      }

      toast.success('Email verified successfully! You can now log in.');
      setVerificationCode(['', '', '', '', '', '']);
      setVerificationType('registration'); // Reset to default
      setActiveForm('login');
      // If we verified registration email, prepopulate login email
      if (registrationEmail) setEmail(registrationEmail);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Request failed');
        return;
      }

      toast.success(data.message);

      // Save email and switch to verification form
      setResetEmail(email);
      setEmail(''); // Clear email field
      setVerificationCode(['', '', '', '', '', '']); // Clear verification code
      setPassword(''); // Clear password fields
      setConfirmPassword('');
      setVerificationType('password-reset'); // Set verification type
      setActiveForm('verify'); // Switch to verify form first
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const code = verificationCode.join('');

    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          resetCode: code,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Reset failed');
        return;
      }

      toast.success('Password reset successfully! You can now log in.');

      // Clear form and switch to login
      setPassword('');
      setConfirmPassword('');
      setVerificationCode(['', '', '', '', '', '']);
      setResetEmail('');
      setVerificationType('registration'); // Reset to default
      setActiveForm('login');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    switch (activeForm) {
      case 'login':
        return handleLogin(e);
      case 'register':
        return handleRegister(e);
      case 'verify':
        return handleVerify(e);
      case 'forgot':
        return handleForgotPassword(e);
      case 'reset-password':
        return handleResetPassword(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header with tabs */}
        <div className="flex border-b border-[var(--border)]">
          <button
            className={`flex-1 py-4 font-medium text-center ${activeForm === 'login' ? 'text-[var(--primary)] cursor-pointer border-b-2 border-[var(--primary)]' : 'text-text'}`}
            onClick={() => setActiveForm('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 font-medium text-center ${activeForm === 'register' ? 'text-[var(--primary)] cursor-pointer border-b-2 border-[var(--primary)]' : 'text-text'}`}
            onClick={() => setActiveForm('register')}
          >
            Register
          </button>
        </div>

        {/* Form content */}
        <div className="p-6">
          {activeForm === 'login' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Welcome back</h2>

              <div className="mb-4">
                <label htmlFor="login-email" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Email or phone
                </label>
                <input
                  id="login-email"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Email or phone number"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="login-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showLoginPass ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <label className="flex items-center text-sm text-[var(--text)]">
                  <input type="checkbox" className="rounded text-[var(--primary)] focus:ring-[var(--primary)]" />
                  <span className="ml-2">Remember me</span>
                </label>

                <button
                  type="button"
                  className="text-sm text-[var(--primary)] hover:underline"
                  onClick={() => setActiveForm('forgot')}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 cursor-pointer bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-text">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="text-[var(--primary)] hover:underline"
                    onClick={() => setActiveForm('register')}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          )}

          {activeForm === 'register' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Create account</h2>

              <div className="mb-4">
                <label htmlFor="register-name" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="register-email" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Role is hardcoded to STUDENT, so hidden from UI */}

              <div className="mb-4">
                <label htmlFor="register-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showRegPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showRegPass ? 'Hide password' : 'Show password'}
                  >
                    {showRegPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={showRegConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showRegConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showRegConfirmPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 cursor-pointer bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-text">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-[var(--primary)] hover:underline"
                    onClick={() => setActiveForm('login')}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}

          {activeForm === 'forgot' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Reset password</h2>
              <p className="text-text mb-6">
                Enter your email address and we&apos;ll send you a code to reset your password.
              </p>

              <div className="mb-6">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Email or phone
                </label>
                <input
                  id="forgot-email"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Email or phone number"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer py-3 px-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending Code...' : 'Send Reset Code'}
              </button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-sm cursor-pointer text-[var(--primary)] hover:underline"
                  onClick={() => setActiveForm('login')}
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          {activeForm === 'verify' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
                {verificationType === 'password-reset' ? 'Verify Reset Code' : 'Verification'}
              </h2>
              <p className="text-text mb-6">
                We&apos;ve sent a 6-digit code to <span className="text-[var(--primary)]">
                  {verificationType === 'password-reset' ? resetEmail : (registrationEmail || email)}
                </span>. Enter it below to continue.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Verification code
                </label>
                <div className="flex justify-between gap-2">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`verification-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerificationInput(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      onPaste={(e) => handlePaste(index, e)}
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      required
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer py-3 px-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : (verificationType === 'password-reset' ? 'Verify Code' : 'Verify Account')}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-text">
                  Didn&apos;t receive the code?{' '}
                  <button type="button" className="text-[var(--primary)] hover:underline">
                    Resend
                  </button>
                </p>
              </div>
            </form>
          )}

          {activeForm === 'reset-password' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Reset Password</h2>
              <p className="text-text mb-6">
                Create a new password for <span className="text-[var(--primary)]">{resetEmail}</span>.
              </p>

              <div className="mb-6 flex items-center justify-center">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded-full font-medium">
                  ✓ Code Verified
                </span>
              </div>

              <div className="mb-4">
                <label htmlFor="new-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showResetPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showResetPass ? 'Hide password' : 'Show password'}
                  >
                    {showResetPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-new-password"
                    type={showResetConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showResetConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showResetConfirmPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer py-3 px-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-sm cursor-pointer text-[var(--primary)] hover:underline"
                  onClick={() => setActiveForm('login')}
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;
