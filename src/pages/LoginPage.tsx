import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from "../utils/navigation";

interface LoginPageProps {
  onBack?: () => void;
}

export default function LoginPage({ onBack }: LoginPageProps) {
  const { go } = useNavigation();

  const { sendOtp, verifyOtp, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [code, setCode] = useState(''); // OTP code input
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resend timer states
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect logic is now handled in AuthContext.verifyOtp
      // This useEffect is kept for backward compatibility
      if (onBack) onBack();
    }
  }, [isAuthenticated, user, onBack]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = window.setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            if (timerRef.current) window.clearInterval(timerRef.current);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [resendTimer]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCode('');
    setResendTimer(0);
    setIsResendDisabled(false);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSendingOtp(true);
    try {
      await sendOtp(email);

      // Show OTP step
      setStep('otp');
      setSuccess('OTP sent to your email. Enter it below.');
      setResendTimer(60);
      setIsResendDisabled(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to send OTP. Please try again.');
      setStep('email');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!code.trim()) {
      setError('Please enter the OTP sent to your email.');
      return;
    }

    if (code.trim().length < 6) {
      setError('OTP seems too short. Please check and try again.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtp(email, code.trim());
      setSuccess('Verification successful! Redirecting...');
      setTimeout(() => {
        // Get the redirect path from localStorage, default to home if not set
        const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
        // Clear the redirect path from localStorage
        localStorage.removeItem('redirectAfterLogin');
        go(redirectPath);
        if (onBack) onBack();
      }, 600);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResendDisabled || isSendingOtp || isVerifying) return;
    setError('');
    setSuccess('');
    setIsSendingOtp(true);

    try {
      await sendOtp(email);
      setSuccess('OTP resent. Check your email.');
      setResendTimer(60);
      setIsResendDisabled(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setError('');
    setSuccess('');
    setCode('');
    setResendTimer(0);
    setIsResendDisabled(false);
    setIsSendingOtp(false);
    setIsVerifying(false);
  };

  // Don't show the login page if user is already authenticated
  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className=" p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'email' ? 'Login / Register' : 'Enter OTP'}
            </h1>
            <p className="text-gray-600">
              {step === 'email'
                ? 'Enter your email to receive an OTP'
                : 'Enter the one-time code we sent to your email'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" />
              <p className="text-emerald-600 text-sm">{success}</p>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                  placeholder="your.email@example.com"
                  disabled={isSendingOtp}
                />
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {isSendingOtp ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
                  <Mail size={40} className="text-amber-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter the code</h3>
                <p className="text-gray-600 mb-2">We sent a one-time code to:</p>
                <p className="font-medium text-gray-900 mb-2">{email}</p>
                <p className="text-sm text-gray-500">The code will expire in a few minutes.</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">OTP Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-center tracking-widest text-lg"
                    placeholder="Enter 6-digit code"
                    disabled={isVerifying || isSendingOtp}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || isSendingOtp}
                  className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isVerifying || isSendingOtp || isResendDisabled}
                  className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {isSendingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Resend OTP
                    </>
                  )}
                </button>

                {isResendDisabled && (
                  <div className="text-center text-sm text-gray-500 mt-1">
                    You can resend in {formatTime(resendTimer)}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={isVerifying || isSendingOtp}
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}

          {onBack && (
            <button
              onClick={onBack}
              disabled={isSendingOtp || isVerifying}
              className="mt-6 w-full text-gray-600 hover:text-amber-700 transition-colors text-sm disabled:opacity-50"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}