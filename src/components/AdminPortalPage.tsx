import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { ShieldCheck, Lock, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminPortalPageProps {
  onExit: () => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({ onExit }) => {
  const { currentUser, showToast } = useApp();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    // Check if session has admin unlock or if current user is admin role
    return sessionStorage.getItem('dc_admin_unlocked') === 'true' || currentUser?.role === 'admin';
  });

  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passcodes for manager/admin access
    if (passcode === 'admin123' || passcode === '01806' || passcode === '01806030750' || passcode === '01845' || passcode === '123456' || passcode === 'admin') {
      sessionStorage.setItem('dc_admin_unlocked', 'true');
      setIsAdminAuthenticated(true);
      setErrorMsg('');
      showToast('এডমিন কন্ট্রোল প্যানেলে স্বাগতম!', 'success');
    } else {
      setErrorMsg('ভুল পাসকোড! সঠিক এডমিন পাসকোড লিখুন (ডিফল্ট: admin123)।');
    }
  };

  const handleAdminLock = () => {
    sessionStorage.removeItem('dc_admin_unlocked');
    setIsAdminAuthenticated(false);
    showToast('এডমিন সেশন সমাপ্ত হয়েছে।', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Isolated Admin Header - Completely separated from user navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center font-sora text-sm shadow-md">
              DC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  DC Top Up <span className="text-amber-400">Admin Portal</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Manager Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">
                আইসোলেটেড ম্যানেজমেন্ট কনসোল
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAdminAuthenticated && (
              <button
                onClick={handleAdminLock}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                লক করুন
              </button>
            )}

            <button
              onClick={onExit}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>স্টোরফ্রন্টে ফিরে যান</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {!isAdminAuthenticated ? (
          /* Secure Passcode Gate */
          <div className="max-w-md mx-auto my-12 sm:my-20 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 font-sora">
                এডমিন অ্যাক্সেস ভেরিফিকেশন
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                এই রুটটি সাধারণ গ্রাহকদের জন্য নয়। DC Top Up এডমিন প্যানেল পরিচালনার জন্য আপনার ম্যানেজার পাসকোড দিন।
              </p>
            </div>

            <form onSubmit={handleUnlockAdmin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ম্যানেজার পাসকোড (Default: admin123)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="পাসকোড লিখুন"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>এডমিন কনসোলে প্রবেশ করুন</span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={onExit}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                ← গ্রাহক শপে ফিরে যান
              </button>
            </div>
          </div>
        ) : (
          /* Live Synchronized Admin Dashboard */
          <div className="space-y-6">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        DC Top Up BD — Isolated Administrator Gateway · Single Source of Truth Synchronized
      </footer>
    </div>
  );
};
