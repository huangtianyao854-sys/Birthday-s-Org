import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useEmailLogin, setUseEmailLogin] = useState(false);
  const [email, setEmail] = useState('');

  const handleClose = useCallback(() => {
    setPasscode('');
    setEmail('');
    setError(null);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Hook Order Safety: ALL hooks are called unconditionally above this line!
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If using email + password login
    if (useEmailLogin) {
      if (!email.trim() || !passcode) {
        setError('Please enter both email and password.');
        return;
      }

      setIsLoading(true);
      try {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: passcode,
        });

        if (loginError) {
          setIsShaking(true);
          setError('Invalid email or password.');
          setTimeout(() => setIsShaking(false), 500);
          return;
        }

        if (data.session && data.user) {
          setPasscode('');
          onSuccess();
          return;
        }
      } catch {
        setError('Unable to authenticate with Supabase. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Default & Quick mode: Admin passcode
    const inputCode = passcode.trim();
    if (!inputCode) {
      setError('Please enter the Admin passcode.');
      return;
    }

    if (inputCode.toUpperCase() === 'H143') {
      setPasscode('');
      setError(null);
      onSuccess();
      return;
    }

    // Passcode incorrect
    setIsShaking(true);
    setError('Incorrect passcode. Access denied.');
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`glass-panel w-full max-w-xs rounded-3xl p-5 text-center border border-pink-500/30 text-slate-100 shadow-2xl relative cursor-default bg-slate-950/85 backdrop-blur-md ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
          title="Close / Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-semibold text-pink-200 mb-1 flex items-center justify-center gap-1.5 pt-1">
          <Lock className="w-4 h-4 text-pink-400" />
          <span>Admin Access</span>
        </h3>

        <p className="text-xs text-slate-400 mb-4">
          {useEmailLogin
            ? 'Sign in with your Supabase account'
            : 'Enter admin passcode to edit settings'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {useEmailLogin && (
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Admin Email"
              autoComplete="username"
              autoFocus
              disabled={isLoading}
              className="w-full bg-slate-900/90 border border-pink-500/30 focus:border-pink-400 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          )}

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(null);
              }}
              placeholder={useEmailLogin ? 'Password' : 'Enter Passcode'}
              autoComplete={useEmailLogin ? 'current-password' : 'off'}
              autoFocus={!useEmailLogin}
              disabled={isLoading}
              className="w-full bg-slate-900/90 border border-pink-500/30 focus:border-pink-400 rounded-xl py-2 pl-3 pr-10 text-xs sm:text-sm text-center text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-mono tracking-wider"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-lg py-1.5 px-2 animate-fade-in text-left">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-60 text-white font-medium text-xs shadow-md shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : useEmailLogin ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <KeyRound className="w-3.5 h-3.5" />
              )}

              <span>{isLoading ? 'Checking...' : useEmailLogin ? 'Sign In' : 'Unlock'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setUseEmailLogin(!useEmailLogin);
                setError(null);
              }}
              className="text-[11px] text-pink-400/80 hover:text-pink-300 transition-colors underline cursor-pointer"
            >
              {useEmailLogin
                ? 'Use admin passcode instead'
                : 'Need Supabase Email login? Click here'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};