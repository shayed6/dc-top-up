import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LoyaltyTier, Order } from '../types';
import { 
  User as UserIcon, Wallet, PlusCircle, Award, Sparkles, 
  ShoppingBag, CheckCircle2, Clock, ArrowRight, ShieldCheck, 
  Copy, Check, Edit3, Save, X, RefreshCw, Star, 
  ExternalLink, Gamepad2, Gift, ChevronRight, Zap, Phone, Mail, Calendar, MessageCircle
} from 'lucide-react';
import { SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';

export const UserProfileView: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    products,
    setActiveTab, 
    setSelectedProduct,
    setActiveTrackingOrderId, 
    updateUserProfile, 
    redeemLoyaltyPoints,
    showToast,
    logout
  } = useApp();

  // Profile Edit Modal / Inline State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editEmail, setEditEmail] = useState(currentUser.email || '');
  const [editGameUid, setEditGameUid] = useState(currentUser.savedGameUid || '');

  // Loyalty Points Redemption State
  const [customRedeemPoints, setCustomRedeemPoints] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Order summary filter
  const [orderFilter, setOrderFilter] = useState<'all' | 'delivered' | 'processing' | 'pending'>('all');

  // User orders
  const myOrders = orders.filter((o) => o.userId === currentUser.id);
  const totalOrders = myOrders.length;
  const totalSpent = myOrders.reduce((sum, o) => sum + o.price, 0);
  const deliveredOrders = myOrders.filter((o) => o.status === 'delivered');
  const activeOrders = myOrders.filter((o) => o.status === 'pending' || o.status === 'processing');

  const filteredOrders = myOrders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const loyaltyPoints = currentUser.loyaltyPoints ?? 125;
  const currentTier: LoyaltyTier = currentUser.tier || 
    (loyaltyPoints >= 400 ? 'Diamond' : loyaltyPoints >= 150 ? 'Gold' : loyaltyPoints >= 50 ? 'Silver' : 'Bronze');

  // Next tier calculation
  let nextTierName = 'Diamond';
  let pointsForNextTier = 400;
  let progressPercent = 100;

  if (currentTier === 'Bronze') {
    nextTierName = 'Silver';
    pointsForNextTier = 50;
    progressPercent = Math.min(100, Math.round((loyaltyPoints / 50) * 100));
  } else if (currentTier === 'Silver') {
    nextTierName = 'Gold';
    pointsForNextTier = 150;
    progressPercent = Math.min(100, Math.round(((loyaltyPoints - 50) / 100) * 100));
  } else if (currentTier === 'Gold') {
    nextTierName = 'Diamond';
    pointsForNextTier = 400;
    progressPercent = Math.min(100, Math.round(((loyaltyPoints - 150) / 250) * 100));
  } else {
    nextTierName = 'Maximum Level VIP';
    pointsForNextTier = 400;
    progressPercent = 100;
  }

  const pointsNeeded = Math.max(0, pointsForNextTier - loyaltyPoints);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast(`${label} কপি করা হয়েছে!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('নাম খালি রাখা যাবে না!', 'error');
      return;
    }
    updateUserProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      savedGameUid: editGameUid.trim()
    });
    setIsEditingProfile(false);
  };

  const handleQuickRedeem = (points: number) => {
    setIsRedeeming(true);
    redeemLoyaltyPoints(points);
    setIsRedeeming(false);
  };

  const handleCustomRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(customRedeemPoints, 10);
    if (isNaN(pts) || pts <= 0) {
      showToast('সঠিক পয়েন্ট পরিমাণ লিখুন', 'error');
      return;
    }
    if (pts > loyaltyPoints) {
      showToast(`আপনার মাত্র ${loyaltyPoints} পয়েন্ট রয়েছে!`, 'error');
      return;
    }
    redeemLoyaltyPoints(pts);
    setCustomRedeemPoints('');
  };

  const handleTrackOrder = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setActiveTab('orders');
  };

  const handleReorder = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    } else {
      setActiveTab('home');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 bg-white text-black">
      {/* 1. Account Profile Header Hero */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center border-2 border-white shadow-md">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div 
                className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-white shadow-xs ${
                  currentTier === 'Diamond'
                    ? 'bg-blue-600'
                    : currentTier === 'Gold'
                    ? 'bg-amber-600'
                    : currentTier === 'Silver'
                    ? 'bg-slate-600'
                    : 'bg-amber-800'
                }`}
              >
                {currentTier}
              </div>
            </div>

            {/* User Core Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  {currentUser.name}
                </h2>
                {currentUser.role === 'admin' ? (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-black text-white">
                    এডমিন
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ভেরিফাইড গেমার আইডি</span>
                  </span>
                )}
              </div>

              {/* Clean typographic metadata without pill enclosures */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 font-medium">
                <span className="font-mono text-black font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{currentUser.phone}</span>
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{currentUser.email || 'ইমেইল যুক্ত করুন'}</span>
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>যোগদান: {currentUser.joinedAt}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-500">
                <span>অ্যাকাউন্ট আইডি: </span>
                <span className="font-mono font-bold text-black">{currentUser.id}</span>
                <button
                  onClick={() => handleCopy(currentUser.id, 'অ্যাকাউন্ট আইডি')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer transition-colors"
                  title="কপি করুন"
                >
                  {copiedId === currentUser.id ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              id="profile-edit-trigger-btn"
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone);
                setEditEmail(currentUser.email || '');
                setEditGameUid(currentUser.savedGameUid || '');
                setIsEditingProfile(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-black border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-700" />
              <span>প্রোফাইল পরিবর্তন</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Saved Player UID bar if exists */}
        {currentUser.savedGameUid && (
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 font-medium">সংরক্ষিত গেম Player ID (UID):</span>
              <span className="font-mono font-extrabold text-black bg-white px-2 py-0.5 rounded border border-slate-300">
                {currentUser.savedGameUid}
              </span>
            </div>
            <button
              onClick={() => handleCopy(currentUser.savedGameUid!, 'Player UID')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>কপি</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Wallet & Balance Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Wallet Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              বর্তমান ওয়ালেট ব্যালেন্স
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black font-sans">
              ৳ {currentUser.walletBalance.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">ইনস্ট্যান্ট গেম টপ-আপের জন্য প্রস্তুত</span>
          </div>
          <button
            onClick={() => setActiveTab('deposit')}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>টাকা যোগ করুন (Deposit)</span>
          </button>
        </div>

        {/* Loyalty Points Total */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              লয়ালটি রিওয়ার্ড পয়েন্ট
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-sans flex items-center gap-1.5">
              <span>{loyaltyPoints}</span>
              <span className="text-base text-slate-700 font-bold">পয়েন্ট</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              সমমূল্য: ৳ {(loyaltyPoints / 10).toFixed(2)} ওয়ালেট ক্যাশ
            </span>
          </div>
          <a
            href="#loyalty-rewards-section"
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-900 hover:text-amber-900 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>পয়েন্ট রিডিম করুন</span>
          </a>
        </div>

        {/* Lifetime Top-Up Spend */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              মোট টপ-আপ ব্যয়
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black font-sans">
              ৳ {totalSpent.toFixed(0)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{totalOrders} টি অর্ডারে সফলভাবে সম্পন্ন</span>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>অর্ডার ট্র্যাকিং দেখুন</span>
          </button>
        </div>
      </div>

      {/* 3. Loyalty Points & VIP Club (ডিসি লয়ালটি ক্লাব) */}
      <div 
        id="loyalty-rewards-section"
        className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base sm:text-lg font-black text-black">
                DC লয়ালটি রিওয়ার্ড ও ভিআইপি ক্লাব
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              প্রতিটি গেম টপ-আপে প্রতি ১০ টাকায় ১ লয়ালটি পয়েন্ট লাভ করুন এবং তা দিয়ে ওয়ালেটে ক্যাশ রিচার্জ করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700">বর্তমান মেম্বারশিপ:</span>
            <span 
              className={`px-3 py-1 rounded-lg text-xs font-extrabold text-white flex items-center gap-1 ${
                currentTier === 'Diamond'
                  ? 'bg-blue-600'
                  : currentTier === 'Gold'
                  ? 'bg-amber-600'
                  : currentTier === 'Silver'
                  ? 'bg-slate-700'
                  : 'bg-amber-800'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>{currentTier} VIP</span>
            </span>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-black flex items-center gap-1">
              <span>পরবর্তী স্তর:</span>
              <span className="text-amber-700 font-extrabold">{nextTierName}</span>
            </span>
            <span className="text-slate-600 font-semibold font-mono">
              {currentTier === 'Diamond' ? 'সর্বোচ্চ স্তর অর্জিত' : `আর ${pointsNeeded} পয়েন্ট বাকি`}
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Bronze (০-৪৯)</span>
            <span>Silver (৫০-১৪৯)</span>
            <span>Gold (১৫০-৩৯৯)</span>
            <span>Diamond (৪০০+)</span>
          </div>
        </div>

        {/* VIP Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-black">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>ক্যাশব্যাক রিওয়ার্ড</span>
            </div>
            <p className="text-[11px] text-slate-600">
              টপ-আপের ১০% পর্যন্ত ক্যাশব্যাক ভ্যালু পয়েন্ট অ্যাকাউন্টে জমা হয়।
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-black">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>সুপারফাস্ট ডেলিভারি</span>
            </div>
            <p className="text-[11px] text-slate-600">
              ভিআইপি সদস্যদের জন্য প্রায়োরিটি সার্ভার কিউ ও ইনস্ট্যান্ট অটো-ডেলিভারি।
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-black">
              <Gift className="w-4 h-4 text-blue-600" />
              <span>এক্সক্লুসিভ প্রোমো অফার</span>
            </div>
            <p className="text-[11px] text-slate-600">
              ফ্রাইডে বোনাস ডায়মন্ড ও ভিআইপি স্পেশাল ডিসকাউন্ট কোডের অ্যাক্সেস।
            </p>
          </div>
        </div>

        {/* Interactive Point Redemption Bar */}
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-700" />
                <span>পয়েন্ট কনভার্ট করে সরাসরি ওয়ালেটে টাকা যোগ করুন</span>
              </h4>
              <p className="text-xs text-amber-900 font-medium">
                কনভার্সন রেট: ১০ পয়েন্ট = ৳ ১.০০ ওয়ালেট ক্যাশ (৫০ পয়েন্ট = ৳ ৫.০০)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-950 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 self-start sm:self-auto">
              উপলব্ধ: {loyaltyPoints} পয়েন্ট
            </span>
          </div>

          {/* Quick Redeem Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-700">দ্রুত রিডিম করুন:</span>
            
            <button
              onClick={() => handleQuickRedeem(50)}
              disabled={loyaltyPoints < 50 || isRedeeming}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                loyaltyPoints >= 50
                  ? 'bg-white hover:bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              ৫০ পয়েন্ট (৳ ৫)
            </button>

            <button
              onClick={() => handleQuickRedeem(100)}
              disabled={loyaltyPoints < 100 || isRedeeming}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                loyaltyPoints >= 100
                  ? 'bg-white hover:bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              ১০০ পয়েন্ট (৳ ১০)
            </button>

            <button
              onClick={() => handleQuickRedeem(200)}
              disabled={loyaltyPoints < 200 || isRedeeming}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                loyaltyPoints >= 200
                  ? 'bg-white hover:bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              ২০০ পয়েন্ট (৳ ২০)
            </button>
          </div>

          {/* Custom Points Input Form */}
          <form onSubmit={handleCustomRedeem} className="flex items-center gap-2 max-w-sm pt-1">
            <input
              type="number"
              min="10"
              max={loyaltyPoints}
              step="10"
              placeholder="কাস্টম পয়েন্ট (যেমন: ৫০)"
              value={customRedeemPoints}
              onChange={(e) => setCustomRedeemPoints(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={!customRedeemPoints || isRedeeming || loyaltyPoints < 10}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-extrabold text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              কনভার্ট করুন
            </button>
          </form>
        </div>
      </div>

      {/* 4. Order History Summary (অর্ডার ইতিহাস সারসংক্ষেপ) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-black text-black">
                অর্ডার ইতিহাস ও লেনদেন সারসংক্ষেপ
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              আপনার সাম্প্রতিক কেনাকাটা ও ডায়মন্ড টপ-আপের স্ট্যাটাস দেখুন।
            </p>
          </div>

          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-extrabold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>সব অর্ডার বিস্তারিত দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          <button
            onClick={() => setOrderFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              orderFilter === 'all'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-slate-300 hover:bg-slate-100'
            }`}
          >
            সব ({totalOrders})
          </button>
          <button
            onClick={() => setOrderFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              orderFilter === 'delivered'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-slate-300 hover:bg-slate-100'
            }`}
          >
            ডেলিভার্ড ({deliveredOrders.length})
          </button>
          <button
            onClick={() => setOrderFilter('processing')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              orderFilter === 'processing'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-slate-300 hover:bg-slate-100'
            }`}
          >
            প্রসেসিং ({myOrders.filter((o) => o.status === 'processing').length})
          </button>
          <button
            onClick={() => setOrderFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              orderFilter === 'pending'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-slate-300 hover:bg-slate-100'
            }`}
          >
            পেন্ডিং ({myOrders.filter((o) => o.status === 'pending').length})
          </button>
        </div>

        {/* Orders List / Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-sm text-black">কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="text-xs text-slate-600">আপনি এখনো কোনো টপ-আপ করেননি অথবা এই ফিল্টারে কোনো অর্ডার নেই।</p>
            <button
              onClick={() => setActiveTab('home')}
              className="mt-2 px-4 py-2 rounded-xl bg-black text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>টপ-আপ শপে যান</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOrders.slice(0, 6).map((order) => {
              const matchingProduct = products.find((p) => p.id === order.productId);
              return (
                <div
                  key={order.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    {matchingProduct?.image ? (
                      <img
                        src={matchingProduct.image}
                        alt={order.productTitle}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 text-slate-600">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-black">{order.productTitle}</span>
                        <span className="font-mono text-xs text-slate-500">#{order.id}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-700">
                        <span className="font-bold text-black">{order.packageName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600">UID: <span className="font-mono font-bold text-black">{order.playerId}</span></span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">{order.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price, Status & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-black font-sans">
                        ৳ {order.price}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider block ${
                          order.status === 'delivered'
                            ? 'text-emerald-700'
                            : order.status === 'processing'
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {order.status === 'delivered'
                          ? 'ডেলিভার্ড ✓'
                          : order.status === 'processing'
                          ? 'প্রসেসিং ⚡'
                          : 'পেন্ডিং ⏳'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTrackOrder(order.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="লাইভ ট্র্যাকিং দেখুন"
                      >
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>ট্র্যাক</span>
                      </button>

                      <button
                        onClick={() => handleReorder(order.productId)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="একই পণ্য আবার কিনুন"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-700" />
                        <span>পুনরায়</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Account Security & Support Helpline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Security & Verification Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-black">অ্যাকাউন্ট নিরাপত্তা ও স্থিতি</h4>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="font-medium">মোবাইল নম্বর যাচাই</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>যাচাইকৃত (Active)</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="font-medium">পেমেন্ট মেথড গেটওয়ে</span>
              <span className="text-slate-800 font-semibold">বিকাশ, নগদ ও রকেট সক্রিয়</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-medium">লগইন সেশন</span>
              <span className="text-slate-800 font-mono">সুরক্ষিত ব্রাউজার সেশন</span>
            </div>
          </div>
        </div>

        {/* Support Helpline Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-black">সাহায্য ও কাস্টমার সাপোর্ট</h4>
          </div>
          <p className="text-xs text-slate-600">
            টপ-আপ বা ডিপোজিট সংক্রান্ত যেকোনো প্রয়োজনে আমাদের ডেডিকেটেড হোয়াটসঅ্যাপ হেল্পলাইনে যোগাযোগ করুন।
          </p>
          <a
            href={SUPPORT_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>২৪/৭ WhatsApp সাপোর্ট ({SUPPORT_PHONE_FORMATTED})</span>
          </a>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-black" />
                <h3 className="font-extrabold text-base text-black">প্রোফাইল তথ্য পরিবর্তন</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 text-slate-500 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black block">আপনার পুরো নাম</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black block">ফোন নম্বর</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black block">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black block">ডিফল্ট গেম Player ID (UID)</label>
                <input
                  type="text"
                  value={editGameUid}
                  onChange={(e) => setEditGameUid(e.target.value)}
                  placeholder="যেমন: 2847591028"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <span className="text-[11px] text-slate-500 block">
                  এটি সেভ রাখলে টপ-আপ করার সময় অটো-ফিল হবে।
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
