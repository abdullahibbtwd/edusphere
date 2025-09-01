"use client"

import { useState } from 'react';
import { useTheme } from "next-themes";

const AuthSystem = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [activeForm, setActiveForm] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission based on activeForm state
    console.log('Form submitted:', { activeForm, email, password, name, confirmPassword, verificationCode });
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
                className="w-full py-3 px-4 cursor-pointer bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Sign in
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
                className="w-full py-3 px-4 cursor-pointer bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Create Account
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
                className="w-full cursor-pointer py-3 px-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Send Reset Code
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
                className="w-full cursor-pointer py-3 px-4 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Verify Account
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
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;