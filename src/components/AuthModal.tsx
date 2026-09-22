import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, X, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPhone, showToast } = useApp();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('01712345678');
  const [name, setName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      showToast('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (01XXXXXXXXX)', 'error');
      return;
    }
    setStep('otp');
    setTimer(30);
    showToast(`ভেরিফিকেশন কোড পাঠানো হয়েছে: ${cleanPhone} (ডেমো কোড: 1234)`, 'info');
  };

  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length < 4) {
      showToast('৪ ডিজিটের ওটিপি সম্পূর্ণ লিখুন', 'error');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      loginWithPhone(phoneNumber, name || undefined);
      setIsVerifying(false);
      onClose();
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-300 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-black">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-black font-extrabold text-xs">
              DC
            </div>
            <div>
              <h3 className="font-extrabold text-base text-black">
                {step === 'phone' ? 'লগইন বা রেজিস্ট্রেশন' : 'ওটিপি (OTP) ভেরিফিকেশন'}
              </h3>
              <p className="text-[11px] text-slate-800 font-medium">DC Top Up একাউন্ট</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-black flex items-center justify-center cursor-pointer border border-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-black font-bold block">আপনার নাম (ঐচ্ছিক)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: সায়েদ আফ্রিদী"
                className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-3.5 py-2.5 text-black placeholder-slate-500 text-sm focus:outline-none shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-black font-bold block">বাংলাদেশি মোবাইল নম্বর *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-black flex items-center gap-1">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-white border border-slate-300 focus:border-black rounded-xl pl-20 pr-4 py-2.5 text-black font-mono text-sm focus:outline-none focus:ring-1 focus:ring-black shadow-xs"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-800 font-medium">
                এই নম্বরে একটি ৪ ডিজিটের এসএমএস ওটিপি কোড পাঠানো হবে।
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>ওটিপি কোড পাঠান</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <div className="text-[11px] text-slate-800 text-center flex items-center justify-center gap-1.5 pt-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>১০০% নিরাপদ ও পাসওয়ার্ডহীন ওটিপি লগইন</span>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
              <p className="text-slate-800 font-medium">কোড পাঠানো হয়েছে:</p>
              <p className="font-mono font-extrabold text-black text-sm">{phoneNumber}</p>
              <button
                onClick={() => setStep('phone')}
                className="text-black text-[11px] font-bold hover:underline cursor-pointer"
              >
                নম্বর পরিবর্তন করুন
              </button>
            </div>

            {/* 4-digit OTP input boxes */}
            <div className="flex justify-center gap-2.5 my-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-300 focus:border-black text-center font-mono text-lg font-extrabold text-black focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-800 px-1 font-medium">
              <span>ডেমো ওটিপি: <strong className="text-black font-mono font-extrabold">1234</strong></span>
              {timer > 0 ? (
                <span>পুনরায় পাঠান: {timer}s</span>
              ) : (
                <button
                  onClick={() => {
                    setTimer(30);
                    showToast('নতুন ওটিপি পাঠানো হয়েছে!', 'info');
                  }}
                  className="text-black font-bold hover:underline cursor-pointer"
                >
                  কোড আসেনি? আবার পাঠান
                </button>
              )}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>যাচাই হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>লগইন সম্পন্ন করুন</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
