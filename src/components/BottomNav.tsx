import React from 'react';
import { useApp } from '../context/AppContext';
import { Gamepad2, PlusCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isAdminMode, setIsAdminMode, deposits, orders } = useApp();

  const pendingDepositsCount = deposits.filter((d) => d.status === 'pending').length;
  const processingOrdersCount = orders.filter((o) => o.status === 'processing').length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 pb-safe shadow-lg text-black">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          id="mobile-nav-home-btn"
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('home');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'home' && !isAdminMode
              ? 'text-emerald-800 font-extrabold'
              : 'text-black hover:text-emerald-700 font-semibold'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-0.5 text-emerald-700" />
          <span className="text-[11px] leading-tight">টপ-আপ</span>
        </button>

        {/* Add Money - Hero Button */}
        <button
          id="mobile-nav-deposit-btn"
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('deposit');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'deposit' && !isAdminMode
              ? 'text-emerald-800 font-extrabold'
              : 'text-black hover:text-emerald-700 font-semibold'
          }`}
        >
          <div className="relative">
            <PlusCircle className="w-5 h-5 mb-0.5 text-emerald-700" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          </div>
          <span className="text-[11px] leading-tight">টাকা যোগ</span>
        </button>

        {/* Orders */}
        <button
          id="mobile-nav-orders-btn"
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('orders');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'orders' && !isAdminMode
              ? 'text-blue-900 font-extrabold'
              : 'text-black hover:text-blue-700 font-semibold'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-blue-700" />
            {processingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center">
                {processingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">অর্ডার</span>
        </button>

        {/* Admin Dashboard */}
        <button
          id="mobile-nav-admin-btn"
          onClick={() => {
            setIsAdminMode(true);
            setActiveTab('admin');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isAdminMode
              ? 'text-amber-900 font-extrabold'
              : 'text-black hover:text-amber-700 font-semibold'
          }`}
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-700" />
            {pendingDepositsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-black font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                {pendingDepositsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">এডমিন</span>
        </button>
      </div>
    </nav>
  );
};
