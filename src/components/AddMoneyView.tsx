import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PAYMENT_ACCOUNTS, SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';
import { PaymentMethodType, DepositRequest } from '../types';
import { 
  Copy, Check, AlertCircle, Clock, CheckCircle2, XCircle, 
  Wallet, ShieldAlert, ArrowRight, Info, RefreshCw, Smartphone, ExternalLink, MessageCircle
} from 'lucide-react';

export const AddMoneyView: React.FC = () => {
  const { deposits, submitDeposit, currentUser, showToast } = useApp();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('bkash');
  const [amount, setAmount] = useState<string>('250');
  const [senderPhone, setSenderPhone] = useState<string>(currentUser.phone || '');
  const [trxId, setTrxId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [selectedRejectedDeposit, setSelectedRejectedDeposit] = useState<DepositRequest | null>(null);

  const currentAccount = PAYMENT_ACCOUNTS[selectedMethod];

  const quickAmounts = [100, 250, 500, 1000, 2000];

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedNumber(true);
    showToast(`${num} নম্বরটি ক্লিপবোর্ডে কপি হয়েছে!`, 'success');
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 20) {
      showToast('সর্বনিম্ন ২০ টাকা ডিপোজিট করতে হবে।', 'error');
      return;
    }

    if (!senderPhone || senderPhone.trim().length < 11) {
      showToast('অনুগ্রহ করে সঠিক ১১ ডিজিটের প্রেরক নম্বর লিখুন (01XXXXXXXXX)।', 'error');
      return;
    }

    if (!trxId || trxId.trim().length < 6) {
      showToast('অনুগ্রহ করে সঠিক Transaction ID (TrxID) লিখুন।', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitDeposit(selectedMethod, numAmount, senderPhone.trim(), trxId.trim());
      setTrxId('');
      setActiveTab('history');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter user's deposits
  const myDeposits = deposits.filter((d) => d.userId === currentUser.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-10 bg-white text-black">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-500 via-blue-500 to-amber-400 shrink-0 shadow-md shadow-cyan-500/20">
            <img
              src="/dc_logo.jpg"
              alt="DC Wallet"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-black flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-700" />
              <span>ডিসি ওয়ালেটে টাকা যোগ (DC Wallet Recharge)</span>
            </h2>
            <p className="text-xs text-slate-800 mt-0.5 font-medium">
              বিকাশ, নগদ বা রকেটে সেন্ড মানি করে ব্যালেন্স রিচার্জ করুন। ৩-৫ মিনিটে ভেরিফিকেশন সম্পন্ন হবে।
            </p>
          </div>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 shrink-0 text-left sm:text-right shadow-xs">
          <span className="text-[10px] text-slate-700 uppercase tracking-wider font-bold block">বর্তমান ওয়ালেট ব্যালেন্স</span>
          <span className="text-xl font-extrabold text-black font-sans">
            ৳ {currentUser.walletBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Navigation Switch between Form and Deposit History */}
      <div className="flex border-b border-slate-200">
        <button
          id="deposit-tab-form-btn"
          onClick={() => setActiveTab('form')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'form'
              ? 'border-black text-black'
              : 'border-transparent text-slate-600 hover:text-black'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>টাকা পাঠানোর ফর্ম</span>
        </button>

        <button
          id="deposit-tab-history-btn"
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-black text-black'
              : 'border-transparent text-slate-600 hover:text-black'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ডিপোজিট হিস্টোরি</span>
          {myDeposits.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-black font-bold border border-slate-300">
              {myDeposits.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'form' ? (
        <div className="space-y-6">
          {/* Step 1: Select Payment Method */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-black flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 text-xs flex items-center justify-center font-extrabold border border-emerald-300">১</span>
                <span>পেমেন্ট মাধ্যম বেছে নিন</span>
              </label>
              <span className="text-xs text-slate-800 font-bold">শুধু Send Money প্রযোজ্য</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* bKash */}
              <button
                type="button"
                id="select-method-bkash"
                onClick={() => setSelectedMethod('bkash')}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  selectedMethod === 'bkash'
                    ? 'bg-rose-50 border-[#D82365] text-black shadow-xs scale-[1.02]'
                    : 'bg-white border-slate-300 text-black hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#D82365] flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                  বিকাশ
                </div>
                <span className="text-xs font-bold text-black">bKash</span>
                <span className="text-[10px] text-slate-700 font-semibold">পার্সোনাল</span>
              </button>

              {/* Nagad */}
              <button
                type="button"
                id="select-method-nagad"
                onClick={() => setSelectedMethod('nagad')}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  selectedMethod === 'nagad'
                    ? 'bg-orange-50 border-[#F25822] text-black shadow-xs scale-[1.02]'
                    : 'bg-white border-slate-300 text-black hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F25822] flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                  নগদ
                </div>
                <span className="text-xs font-bold text-black">Nagad</span>
                <span className="text-[10px] text-slate-700 font-semibold">পার্সোনাল</span>
              </button>

              {/* Rocket */}
              <button
                type="button"
                id="select-method-rocket"
                onClick={() => setSelectedMethod('rocket')}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  selectedMethod === 'rocket'
                    ? 'bg-purple-50 border-[#8C3494] text-black shadow-xs scale-[1.02]'
                    : 'bg-white border-slate-300 text-black hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#8C3494] flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                  রকেট
                </div>
                <span className="text-xs font-bold text-black">Rocket</span>
                <span className="text-[10px] text-slate-700 font-semibold">পার্সোনাল</span>
              </button>
            </div>

            {/* Official Account Box with Copy Button */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[11px] text-slate-800 font-bold block">
                  {currentAccount.name} নম্বর:
                </span>
                <div className="text-lg font-mono font-bold text-black tracking-wider flex items-center gap-2 mt-0.5">
                  <span>{currentAccount.number}</span>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 font-bold border border-emerald-300">
                    Send Money Only
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="copy-account-number-btn"
                onClick={() => handleCopyNumber(currentAccount.number)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                {copiedNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedNumber ? 'কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
              </button>
            </div>

            {/* Step-by-step instructions in Bangla */}
            <div className="space-y-2 pt-2 text-xs text-black">
              <p className="font-bold text-black flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>টাকা পাঠানোর নিয়মাবলি ({currentAccount.method.toUpperCase()}):</span>
              </p>
              <ul className="space-y-1.5 pl-5 list-decimal text-slate-800 font-medium">
                {currentAccount.instructions.map((inst, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step 2: Verification Form */}
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-black flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 text-xs flex items-center justify-center font-extrabold border border-emerald-300">২</span>
                <span>লেনদেনের তথ্য পূরণ করুন</span>
              </label>
              <span className="text-[11px] text-emerald-800 font-bold">চার্জ: ৳ ০.০০ (ফ্রি)</span>
            </div>

            {/* Quick Amount Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black block">
                টাকার পরিমাণ (Amount in BDT) *
              </label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      amount === q.toString()
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-black border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    ৳ {q}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black font-bold">
                  ৳
                </span>
                <input
                  id="deposit-amount-input"
                  type="number"
                  min="20"
                  max="25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="টাকার পরিমাণ লিখুন (যেমন: 250)"
                  className="w-full bg-white border border-slate-300 focus:border-black rounded-xl pl-9 pr-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
                  required
                />
              </div>
            </div>

            {/* Sender Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black block">
                যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number) *
              </label>
              <input
                id="deposit-sender-phone-input"
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
                required
              />
              <p className="text-[11px] text-slate-800 font-medium">
                আপনার যে বিকাশ/নগদ/রকেট নম্বর থেকে সেন্ড মানি করেছেন সেই নম্বরটি দিন।
              </p>
            </div>

            {/* Transaction ID (TrxID) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black flex items-center justify-between">
                <span>Transaction ID (TrxID / TxnID) *</span>
                <span className="text-[10px] text-slate-700 font-semibold">SMS থেকে ৮-১০ ডিজিটের কোড</span>
              </label>
              <input
                id="deposit-trxid-input"
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                placeholder="যেমন: BKL891J29P অথবা NG772183AA"
                className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              id="deposit-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>ডিপোজিট রিকোয়েস্ট সাবমিট করুন</span>
                </>
              )}
            </button>

            {/* Guarantee Note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 text-[11px] text-black font-medium flex items-start gap-2 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                সতর্কতা: ভুল TrxID বা ফেক রিকোয়েস্ট দিলে একাউন্ট সাময়িক সাসপেন্ড হতে পারে। টাকা সেন্ড মানি সফল হলে তবেই TrxID দিন।
              </span>
            </div>
          </form>
        </div>
      ) : (
        /* Step 3: Deposit History */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-black">আপনার আগের ডিপোজিট রিকোয়েস্টসমূহ</h3>
            <span className="text-xs text-slate-800 font-bold">সর্বমোট {myDeposits.length} টি লেনদেন</span>
          </div>

          {myDeposits.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
              <Wallet className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-black">এখনো কোনো ডিপোজিট করা হয়নি</p>
              <p className="text-xs text-slate-800 font-medium">
                উপরের ট্যাব থেকে টাকা পাঠিয়ে আপনার প্রথম ডিপোজিট সম্পন্ন করুন।
              </p>
              <button
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
              >
                টাকা পাঠান
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myDeposits.map((deposit) => {
                const isPending = deposit.status === 'pending';
                const isApproved = deposit.status === 'approved';
                const isRejected = deposit.status === 'rejected';

                return (
                  <div
                    key={deposit.id}
                    id={`deposit-item-${deposit.id}`}
                    className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md text-white ${
                            deposit.method === 'bkash'
                              ? 'bg-[#D82365]'
                              : deposit.method === 'nagad'
                              ? 'bg-[#F25822]'
                              : 'bg-[#8C3494]'
                          }`}
                        >
                          {deposit.method}
                        </span>
                        <span className="text-sm font-bold text-black font-mono">
                          {deposit.id}
                        </span>
                      </div>

                      {/* Status Badges */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          <span>Pending (যাচাই চলছে)</span>
                        </span>
                      )}

                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Approved (যোগ হয়েছে)</span>
                        </span>
                      )}

                      {isRejected && (
                        <button
                          onClick={() => setSelectedRejectedDeposit(deposit)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 text-xs font-bold hover:bg-rose-200 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-700" />
                          <span>Rejected (কারণ দেখুন)</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-slate-700 block text-[10px] font-bold">টাকার পরিমাণ</span>
                        <span className="font-extrabold text-sm text-black font-sans">
                          ৳ {deposit.amount.toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-700 block text-[10px] font-bold">প্রেরক নম্বর</span>
                        <span className="font-mono text-black font-semibold">{deposit.senderPhone}</span>
                      </div>

                      <div>
                        <span className="text-slate-700 block text-[10px] font-bold">TrxID</span>
                        <span className="font-mono text-emerald-800 font-bold">{deposit.trxId}</span>
                      </div>

                      <div>
                        <span className="text-slate-700 block text-[10px] font-bold">তারিখ ও সময়</span>
                        <span className="text-black font-medium">{deposit.createdAt}</span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="text-[11px] text-amber-950 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>এডমিন আপনার TrxID ভেরিফাই করছেন। সাধারণত ৩-১০ মিনিটের মধ্যে টাকা যোগ হয়ে যায়।</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal for viewing rejection reason */}
      {selectedRejectedDeposit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <AlertCircle className="w-5 h-5" />
                <span>ডিপোজিট বাতিল করার কারণ</span>
              </div>
              <button
                onClick={() => setSelectedRejectedDeposit(null)}
                className="text-black hover:bg-slate-200 text-xs px-2 py-1 rounded bg-slate-100 border border-slate-300 font-bold cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-800 font-medium">
                ডিপোজিট আইডি: <span className="text-black font-mono font-bold">{selectedRejectedDeposit.id}</span>
              </p>
              <p className="text-slate-800 font-medium">
                TrxID: <span className="text-black font-mono font-bold">{selectedRejectedDeposit.trxId}</span>
              </p>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 leading-relaxed font-semibold">
                {selectedRejectedDeposit.rejectReason || 'প্রদত্ত TrxID সঠিক নয় অথবা কোনো টাকা জমা হয়নি।'}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedRejectedDeposit(null);
                setActiveTab('form');
              }}
              className="w-full py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              সঠিক তথ্য দিয়ে আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
