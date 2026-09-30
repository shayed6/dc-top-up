import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, Smartphone, Mail } from 'lucide-react';

interface AuthSectionProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
  isModal?: boolean;
}

export const AuthSection: React.FC<AuthSectionProps> = ({
  initialMode = 'login',
  onSuccess,
  isModal = false
}) => {
  const { loginWithGoogle, signupWithEmail, loginWithEmail, loginWithPhone, setActiveTab, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'google_email' | 'phone'>('google_email');

  // Email / Password Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Phone OTP Form State
  const [phoneNumber, setPhoneNumber] = useState('01712-345678');
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4']);
  const [timer, setTimer] = useState(30);

  // Status & Loading State
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  // Google Sign-in Handler
  const handleGoogleAuth = async () => {
    setStatusType('loading');
    setStatusMsg('গুগল সাইন-ইন প্রসেস হচ্ছে...');
    setIsProcessing(true);

    try {
      await loginWithGoogle();
      setStatusType('success');
      setStatusMsg('লগইন সফল! রিডাইরেক্ট হচ্ছে...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else setActiveTab('deposit');
      }, 500);
    } catch (err: any) {
      setStatusType('error');
      setStatusMsg('গুগল সাইন-ইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  // Email / Password Submit Handler
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusType('idle');
    setStatusMsg('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setStatusType('error');
        setStatusMsg('পাসওয়ার্ড দুটো মিলছে না');
        return;
      }

      setIsProcessing(true);
      setStatusType('loading');
      setStatusMsg('প্রসেস হচ্ছে...');

      const res = await signupWithEmail(name, email, password);
      setIsProcessing(false);

      if (res.success) {
        setStatusType('success');
        setStatusMsg('অ্যাকাউন্ট তৈরি হয়েছে! রিডাইরেক্ট হচ্ছে...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else setActiveTab('deposit');
        }, 800);
      } else {
        setStatusType('error');
        setStatusMsg(res.error || 'অ্যাকাউন্ট তৈরি করা যায়নি, আবার চেষ্টা করুন');
      }
    } else {
      // Login mode
      setIsProcessing(true);
      setStatusType('loading');
      setStatusMsg('যাচাই হচ্ছে...');

      const res = await loginWithEmail(email, password);
      setIsProcessing(false);

      if (res.success) {
        setStatusType('success');
        setStatusMsg('সফল! রিডাইরেক্ট হচ্ছে...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else setActiveTab('deposit');
        }, 800);
      } else {
        setStatusType('error');
        setStatusMsg(res.error || 'লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন');
      }
    }
  };

  // Phone OTP Flow Handlers
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setStatusType('error');
      setStatusMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (01XXXXXXXXX)');
      return;
    }
    setOtpStep('otp');
    setTimer(30);
    showToast(`ভেরিফিকেশন কোড পাঠানো হয়েছে: ${cleanPhone} (ডেমো কোড: 1234)`, 'info');
  };

  const handleVerifyPhoneOtp = () => {
    const code = otpDigits.join('');
    if (code.length < 4) {
      setStatusType('error');
      setStatusMsg('৪ ডিজিটের ওটিপি সম্পূর্ণ লিখুন');
      return;
    }

    setIsProcessing(true);
    setStatusType('loading');
    setStatusMsg('ওটিপি যাচাই হচ্ছে...');

    setTimeout(() => {
      loginWithPhone(phoneNumber, name || undefined);
      setIsProcessing(false);
      setStatusType('success');
      setStatusMsg('লগইন সম্পন্ন হয়েছে!');

      setTimeout(() => {
        if (onSuccess) onSuccess();
        else setActiveTab('deposit');
      }, 700);
    }, 700);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    if (val && index < 3) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className={`w-full ${isModal ? 'max-w-4xl' : 'max-w-4xl my-6 sm:my-10 mx-auto px-3 sm:px-4'}`}>
      <div className="w-full grid grid-cols-1 md:grid-cols-[1.1fr_1fr] bg-white border border-[#14162E]/10 rounded-[18px] overflow-hidden shadow-[0_30px_60px_-30px_rgba(20,22,46,0.18)]">
        
        {/* Left Side: Brand & Visuals */}
        <div className="p-8 sm:p-12 relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#14162E]/10 bg-[#F7F7FA] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E0A500]/8 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Coin Logo Mark */}
            <div className="flex items-center gap-2.5 font-sora font-bold text-[19px] tracking-tight text-[#14162E]">
              <span className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#E0A500] to-[#B98A00] flex items-center justify-center text-[#171B45] font-extrabold text-[14px] font-sora shadow-sm">
                DC
              </span>
              <span>DC Top Up</span>
            </div>

            {/* Headline */}
            <div className="font-sora font-bold text-2xl sm:text-[32px] md:text-[34px] leading-[1.18] tracking-[-0.015em] mt-8 sm:mt-10 mb-3.5 text-[#14162E] max-w-[22ch]">
              {mode === 'login' ? (
                <>
                  টাকা লোড করুন,<br />
                  <span className="text-[#E0A500]">তাৎক্ষণিক</span> কিনুন।
                </>
              ) : (
                <>
                  নতুন অ্যাকাউন্ট<br />
                  <span className="text-[#E0A500]">তৈরি করুন</span>
                </>
              )}
            </div>

            {/* Subtitle */}
            <p className="text-[#6B6F8C] font-inter text-[14.5px] sm:text-[15px] leading-[1.6] max-w-[34ch]">
              {mode === 'login'
                ? 'আপনার ওয়ালেটে ব্যালেন্স রাখুন আর যেকোনো সময় প্রোডাক্ট পারচেজ করুন — নিরাপদ ও দ্রুত।'
                : 'অ্যাকাউন্ট খুলে ওয়ালেটে ব্যালেন্স রাখুন আর যেকোনো সময় প্রোডাক্ট পারচেজ করুন।'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="relative z-10 hidden sm:flex items-center gap-7 mt-10 pt-6 border-t border-[#14162E]/10">
            {mode === 'login' ? (
              <>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">24/7</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Wallet Access</span>
                </div>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Secure</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Firebase Auth</span>
                </div>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Instant</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Purchase</span>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Free</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Sign Up</span>
                </div>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Secure</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Firebase Auth</span>
                </div>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Instant</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Wallet Access</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Panel */}
        <div className="p-7 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-sora font-bold text-[22px] text-[#14162E]">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            {/* Quick Switch Pills */}
            <div className="flex items-center bg-[#F7F7FA] p-1 rounded-xl border border-[#14162E]/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStatusMsg('');
                  setStatusType('idle');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-white text-[#14162E] shadow-xs' : 'text-[#6B6F8C] hover:text-[#14162E]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setStatusMsg('');
                  setStatusType('idle');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  mode === 'signup' ? 'bg-white text-[#14162E] shadow-xs' : 'text-[#6B6F8C] hover:text-[#14162E]'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <p className="text-[#6B6F8C] font-inter text-[14px] mb-6">
            {mode === 'login'
              ? 'Google অ্যাকাউন্ট দিয়ে লগইন করুন, নতুন হলে অটোমেটিক অ্যাকাউন্ট তৈরি হয়ে যাবে।'
              : 'নাম, ইমেইল ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলুন, অথবা Google দিয়ে সরাসরি সাইনআপ করুন।'}
          </p>

          {/* Mode-Specific Forms */}
          {authMethod === 'google_email' ? (
            <div className="space-y-4">
              {/* Google Button */}
              <button
                id="googleAuthBtn"
                type="button"
                disabled={isProcessing}
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 bg-[#14162E] hover:bg-[#202347] active:scale-[0.99] text-white rounded-[10px] py-3.5 px-4 font-inter font-semibold text-[14.5px] cursor-pointer transition-all shadow-sm hover:shadow-[0_10px_24px_-12px_rgba(224,165,0,0.35)] disabled:opacity-70"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.5 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z" />
                  <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.8 14-4.9l-6.5-5.5c-2 1.4-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.1 35.9 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
                </svg>
                <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4 text-[#6B6F8C] text-[12.5px] font-inter">
                <span className="flex-1 h-px bg-[#14162E]/10" />
                <span>অথবা ইমেইল দিয়ে {mode === 'login' ? 'লগইন' : 'রেজিস্ট্রেশন'}</span>
                <span className="flex-1 h-px bg-[#14162E]/10" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailFormSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                      পুরো নাম
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="আপনার নাম"
                      className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] px-3.5 py-2.5 text-[#14162E] font-inter text-[14px] focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                    ইমেইল
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] px-3.5 py-2.5 text-[#14162E] font-inter text-[14px] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                    পাসওয়ার্ড
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ ক্যারেক্টার"
                    className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] px-3.5 py-2.5 text-[#14162E] font-inter text-[14px] focus:outline-none transition-colors"
                  />
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                      পাসওয়ার্ড আবার লিখুন
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড কনফার্ম করুন"
                      className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] px-3.5 py-2.5 text-[#14162E] font-inter text-[14px] focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-5 rounded-[10px] bg-[#E0A500] hover:bg-[#B98A00] active:scale-[0.99] text-white font-inter font-semibold text-[14px] cursor-pointer transition-all shadow-[0_10px_24px_-12px_rgba(224,165,0,0.35)] mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <span>{mode === 'login' ? 'Login করুন' : 'Create Account'}</span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Phone OTP alternative */
            <div className="space-y-4">
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                      বাংলাদেশি মোবাইল নম্বর
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-mono font-bold text-[#14162E] text-xs">
                        🇧🇩 +880
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] pl-20 pr-4 py-2.5 text-[#14162E] font-mono text-sm focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-[10px] bg-[#14162E] hover:bg-[#202347] text-white font-inter font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>ওটিপি কোড পাঠান</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="p-3 rounded-xl bg-[#F7F7FA] border border-[#14162E]/10">
                    <p className="text-xs text-[#6B6F8C]">কোড পাঠানো হয়েছে:</p>
                    <p className="font-mono font-bold text-[#14162E] text-sm">{phoneNumber}</p>
                    <button
                      type="button"
                      onClick={() => setOtpStep('phone')}
                      className="text-xs text-[#E0A500] font-semibold hover:underline mt-1"
                    >
                      নম্বর পরিবর্তন
                    </button>
                  </div>

                  <div className="flex justify-center gap-2 my-2">
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        id={`auth-otp-${i}`}
                        type="text"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        className="w-11 h-11 text-center font-mono text-lg font-bold border border-[#14162E]/10 rounded-xl focus:border-[#E0A500] focus:outline-none"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-[10px] bg-[#E0A500] text-white font-inter font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>যাচাই করে সম্পন্ন করুন</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status Message Line */}
          {statusMsg && (
            <div
              className={`mt-3 text-[13px] min-h-[18px] transition-all ${
                statusType === 'error'
                  ? 'text-[#D3453A] font-medium'
                  : statusType === 'success'
                  ? 'text-[#1F9D6B] font-bold'
                  : 'text-[#6B6F8C]'
              }`}
            >
              {statusMsg}
            </div>
          )}

          {/* Alternate Method Switcher (Email vs Phone) */}
          <div className="mt-4 pt-4 border-t border-[#14162E]/10 flex items-center justify-between text-xs text-[#6B6F8C]">
            <button
              type="button"
              onClick={() => {
                setAuthMethod(authMethod === 'google_email' ? 'phone' : 'google_email');
                setStatusMsg('');
                setStatusType('idle');
              }}
              className="flex items-center gap-1.5 font-medium hover:text-[#14162E] cursor-pointer"
            >
              {authMethod === 'google_email' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#E0A500]" />
                  <span>মোবাইল নম্বর ওটিপি লগইন</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-[#E0A500]" />
                  <span>Google / ইমেইল লগইন</span>
                </>
              )}
            </button>

            {/* Bottom Footer Switcher */}
            <div className="text-right">
              {mode === 'login' ? (
                <span>
                  একাউন্ট নেই?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setStatusMsg('');
                      setStatusType('idle');
                    }}
                    className="text-[#B98A00] font-semibold hover:underline cursor-pointer"
                  >
                    Sign Up করুন
                  </button>
                </span>
              ) : (
                <span>
                  একাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setStatusMsg('');
                      setStatusType('idle');
                    }}
                    className="text-[#B98A00] font-semibold hover:underline cursor-pointer"
                  >
                    Login করুন
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 text-[12px] text-[#6B6F8C] leading-[1.5] text-center border-t border-[#14162E]/5 pt-3">
            লগইন বা সাইন-আপ করার মাধ্যমে আপনি DC Top Up-এর ব্যবহারের শর্তাবলি ও নিয়মাবলি মেনে নিচ্ছেন।
          </div>
        </div>

      </div>
    </div>
  );
};
