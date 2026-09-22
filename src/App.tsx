/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeCatalog } from './components/HomeCatalog';
import { AddMoneyView } from './components/AddMoneyView';
import { OrdersView } from './components/OrdersView';
import { AdminDashboard } from './components/AdminDashboard';
import { PurchaseModal } from './components/PurchaseModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { TopUpProduct } from './types';
import { ShieldCheck, Zap, Headphones, Heart } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, isAdminMode, selectedProduct, setSelectedProduct } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-950">
      <ToastContainer />

      {/* Top Navigation Bar */}
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        {isAdminMode ? (
          <AdminDashboard />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeCatalog
                onSelectProduct={(product: TopUpProduct) => setSelectedProduct(product)}
              />
            )}

            {activeTab === 'deposit' && <AddMoneyView />}

            {activeTab === 'orders' && <OrdersView />}

            {activeTab === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Purchase Modal / Checkout Drawer */}
      {selectedProduct && (
        <PurchaseModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onGoToDeposit={() => {
            setSelectedProduct(null);
            setActiveTab('deposit');
          }}
          onGoToOrders={() => {
            setSelectedProduct(null);
            setActiveTab('orders');
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Desktop / Tablet Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-auto py-8 px-4 text-xs text-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shadow-sm shrink-0">
              <img src="/dc_logo.jpg" alt="DC" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-black font-bold text-sm">DC Top Up (ডিসি টপ-আপ বাংলাদেশ)</p>
              <p className="text-[11px] text-slate-800">
                দ্রুত ও নিরাপদ গেম কারেন্সি ও ওয়ালেট রিচার্জ প্ল্যাটফর্ম
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-black font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>১০০% আইডি নিরাপদ</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>অটোমেটেড দ্রুত ডেলিভারি</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-teal-600" />
              <span>২৪/৭ হেল্পলাইন</span>
            </span>
          </div>

          <div className="text-[11px] text-black text-center md:text-right font-medium">
            <span>পেমেন্ট পার্টনার: </span>
            <span className="text-[#D82365] font-bold">bKash</span> •{' '}
            <span className="text-[#F25822] font-bold">Nagad</span> •{' '}
            <span className="text-[#8C3494] font-bold">Rocket</span>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Bottom Navigation Dock */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
