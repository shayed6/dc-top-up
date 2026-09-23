import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';
import { Wallet, PlusCircle, ShieldCheck, User, LogOut, ChevronDown, Gamepad2, ShoppingBag, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { currentUser, isAdminMode, setIsAdminMode, activeTab, setActiveTab, logout, deposits } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const pendingDepositsCount = deposits.filter((d) => d.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="nav-brand-logo-btn"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-amber-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/dc_logo.jpg"
                alt="DC Top Up Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-black font-sans">
                  DC <span className="text-emerald-600">TOP UP</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                  BD
                </span>
              </div>
              <p className="text-[11px] text-slate-800 font-medium -mt-1 hidden xs:block">
                ওয়ালেট রিচার্জ ও গেম টপ-আপ
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="nav-desktop-home-btn"
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'home' && !isAdminMode
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-600" />
            <span>টপ-আপ শপ</span>
          </button>

          <button
            id="nav-desktop-deposit-btn"
            onClick={() => setActiveTab('deposit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'deposit' && !isAdminMode
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>টাকা যোগ করুন</span>
          </button>

          <button
            id="nav-desktop-orders-btn"
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('orders');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders' && !isAdminMode
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>অর্ডারসমূহ</span>
          </button>

          <button
            id="nav-desktop-profile-btn"
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('profile');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'profile' && !isAdminMode
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <User className="w-4 h-4 text-purple-600" />
            <span>প্রোফাইল</span>
            {currentUser.loyaltyPoints !== undefined && (
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                ★ {currentUser.loyaltyPoints}
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Wallet, Admin Toggle & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Wallet Balance Card */}
          <button
            id="nav-wallet-chip-btn"
            onClick={() => setActiveTab('deposit')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 hover:border-emerald-500 shadow-xs transition-all text-left group"
            title="ওয়ালেট ব্যালেন্স - টাকা যোগ করতে ক্লিক করুন"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-800 uppercase tracking-wider font-bold flex items-center gap-1">
                <span>ব্যালেন্স</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-black tracking-tight -mt-0.5">
                ৳ {currentUser.walletBalance.toFixed(2)}
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-center pl-1 text-emerald-700">
              <PlusCircle className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* Admin Mode Toggle Switch */}
          <button
            id="nav-admin-mode-toggle-btn"
            onClick={() => {
              const next = !isAdminMode;
              setIsAdminMode(next);
              if (next) setActiveTab('admin');
              else setActiveTab('home');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isAdminMode
                ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs'
                : 'bg-white text-black border-slate-300 hover:bg-slate-50'
            }`}
            title="এডমিন ড্যাশবোর্ড ও ডিপোজিট অনুমোদন সুইচ"
          >
            <ShieldCheck className={`w-4 h-4 ${isAdminMode ? 'text-amber-700' : 'text-slate-700'}`} />
            <span className="hidden lg:inline">{isAdminMode ? 'এডমিন ভিউ সক্রিয়' : 'এডমিন প্যানেল'}</span>
            <span className="lg:hidden">এডমিন</span>
            {pendingDepositsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black font-extrabold text-[10px] flex items-center justify-center">
                {pendingDepositsCount}
              </span>
            )}
          </button>

          {/* 24/7 WhatsApp Support Helpline Button */}
          <a
            id="nav-whatsapp-support-btn"
            href={SUPPORT_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title={`২৪/৭ হোয়াটসঅ্যাপ কাস্টমার সাপোর্ট হেল্পলাইন (${SUPPORT_PHONE_FORMATTED})`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-700" />
            <span className="hidden md:inline">২৪/৭ সাপোর্ট</span>
          </a>

          {/* User Account / Profile Dropdown */}
          <div className="relative">
            <button
              id="nav-user-profile-menu-btn"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-black transition-all text-xs font-bold"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs border border-emerald-300">
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate text-black font-semibold">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-black hidden sm:inline" />
            </button>

            {profileDropdownOpen && (
              <div
                id="nav-profile-dropdown"
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-300 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-black"
              >
                <div className="px-3 py-2 border-b border-slate-200">
                  <p className="text-xs text-slate-700">লগইন করা আছে:</p>
                  <p className="text-sm font-bold text-black truncate">{currentUser.name}</p>
                  <p className="text-xs text-slate-800 font-mono mt-0.5">{currentUser.phone}</p>
                </div>

                <div className="py-1">
                  <button
                    id="profile-dropdown-my-profile"
                    onClick={() => {
                      setIsAdminMode(false);
                      setActiveTab('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-black font-bold hover:bg-slate-100 rounded-lg text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span>আমার প্রোফাইল ও লয়ালটি</span>
                    </div>
                    {currentUser.loyaltyPoints !== undefined && (
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {currentUser.loyaltyPoints} pts
                      </span>
                    )}
                  </button>

                  <button
                    id="profile-dropdown-add-money"
                    onClick={() => {
                      setIsAdminMode(false);
                      setActiveTab('deposit');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-black font-semibold hover:bg-slate-100 rounded-lg text-left cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>টাকা যোগ করুন</span>
                  </button>
                  <button
                    id="profile-dropdown-orders"
                    onClick={() => {
                      setActiveTab('orders');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-black font-semibold hover:bg-slate-100 rounded-lg text-left"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                    <span>আমার অর্ডারসমূহ</span>
                  </button>
                  <button
                    id="profile-dropdown-switch-user"
                    onClick={() => {
                      onOpenAuth();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-black font-semibold hover:bg-slate-100 rounded-lg text-left"
                  >
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>অন্য ফোন নম্বরে লগইন</span>
                  </button>
                  <a
                    id="profile-dropdown-whatsapp"
                    href={SUPPORT_WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-950 font-bold hover:bg-emerald-50 rounded-lg text-left"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>২৪/৭ WhatsApp হেল্পলাইন</span>
                  </a>
                </div>

                <div className="pt-1 border-t border-slate-200">
                  <button
                    id="profile-dropdown-logout"
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-lg text-left font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
