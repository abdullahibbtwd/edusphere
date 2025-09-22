"use client"

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

const AuthSystem = () => {
  const { theme } = useTheme();
  const params = useParams();
  const schoolId = params.school as string;
  const isDark = theme === "dark";
  
  const [activeForm, setActiveForm] = useState<'login' | 'register' | 'forgot' | 'verify' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'>('STUDENT');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resetCode, setResetCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

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

  const handleResetCodeInput = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...resetCode];
      newCode[index] = value;
      setResetCode(newCode);
      
      // Auto-focus to next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`reset-${index + 1}`);
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

  const handleResetCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !resetCode[index] && index > 0) {
      const prevInput = document.getElementById(`reset-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setActiveForm('verify');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Redirect to dashboard or handle successful login
        window.location.href = `/${schoolId}/dashboard`;
      } else {
        if (data.requiresVerification) {
          toast.error(data.error);
          setActiveForm('verify');
        } else {
          toast.error(data.error);
        }
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete verification code');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          verificationCode: code
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setActiveForm('login');
        setVerificationCode(['', '', '', '', '', '']);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setActiveForm('reset');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const code = resetCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete reset code');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/schools/${schoolId}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetCode: code,
          newPassword: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setActiveForm('login');
        setResetCode(['', '', '', '', '', '']);
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
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
            <form onSubmit={handleLogin}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Welcome back</h2>
              
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="login-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Enter your password"
                  required
                />
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
                disabled={loading}
                className="w-full py-3 px-4 cursor-pointer bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-text">
                  Don't have an account?{' '}
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
            <form onSubmit={handleRegister}>
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

              <div className="mb-4">
                <label htmlFor="register-role" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Role
                </label>
                <select
                  id="register-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN')}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="PARENT">Parent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="register-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Create a password"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 cursor-pointer bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
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
            <form onSubmit={handleForgotPassword}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Reset password</h2>
              <p className="text-text mb-6">
                Enter your email address and we'll send you a code to reset your password.
              </p>
              
              <div className="mb-6">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer py-3 px-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
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
            <form onSubmit={handleVerify}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Verification</h2>
              <p className="text-text mb-6">
                We've sent a 6-digit code to <span className="text-[var(--primary)]">{email}</span>. Enter it below to continue.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Verification code
                </label>
                <div className="flex justify-between space-x-2">
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
                      className="w-12 h-12 text-center text-xl rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      required
                    />
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer py-3 px-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-text">
                  Didn't receive the code?{' '}
                  <button type="button" className="text-[var(--primary)] hover:underline">
                    Resend
                  </button>
                </p>
              </div>
            </form>
          )}

          {activeForm === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Reset Password</h2>
              <p className="text-text mb-6">
                We've sent a 6-digit code to <span className="text-[var(--primary)]">{email}</span>. Enter it below along with your new password.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Reset code
                </label>
                <div className="flex justify-between space-x-2">
                  {resetCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`reset-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleResetCodeInput(index, e.target.value)}
                      onKeyDown={(e) => handleResetCodeKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="reset-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  New Password
                </label>
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Confirm New Password
                </label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer py-3 px-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
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