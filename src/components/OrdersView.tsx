import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { 
  ShoppingBag, Clock, CheckCircle2, XCircle, Gamepad2, 
  Search, FileText 
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, currentUser, setActiveTab } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // User's orders
  const myOrders = orders.filter((o) => o.userId === currentUser.id);

  const filteredOrders = myOrders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.playerId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-10 bg-white text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-black flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <span>আমার অর্ডারসমূহ (Order History)</span>
          </h2>
          <p className="text-xs text-slate-800 mt-1 font-medium">
            আপনার গেম টপ-আপ অর্ডারের লাইভ ট্র্যাকিং ও বিস্তারিত রিসিট
          </p>
        </div>

        <button
          onClick={() => setActiveTab('home')}
          className="px-4 py-2 rounded-xl bg-black text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>নতুন টপ-আপ করুন</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'সব অর্ডার' },
            { id: 'processing', label: 'প্রসেসিং (চলছে)' },
            { id: 'delivered', label: 'ডেলিভার্ড (সফল)' },
            { id: 'failed', label: 'ব্যর্থ' }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`orders-filter-${tab.id}`}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap border cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-white border-slate-300 text-black hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
          <input
            id="orders-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অর্ডার আইডি বা UID খুঁজুন..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-black placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-black shadow-xs"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-extrabold text-black">কোনো অর্ডার পাওয়া যায়নি</p>
          <p className="text-xs text-slate-800 max-w-sm mx-auto font-medium">
            আপনি এখনো কোনো গেম টপ-আপ করেননি অথবা ফিল্টারে কোনো ম্যাচ মেলেনি।
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs shadow-xs cursor-pointer hover:bg-slate-800"
          >
            টপ-আপ ক্যাটালগে যান
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isProcessing = order.status === 'processing';
            const isDelivered = order.status === 'delivered';
            const isFailed = order.status === 'failed';

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 transition-all space-y-3 shadow-xs"
              >
                {/* Top Row: Game & Status */}
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-800 shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-black">{order.productTitle}</h4>
                      <p className="text-xs text-emerald-800 font-bold">{order.packageName}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isProcessing && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-950 border border-blue-300 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <span>Processing (প্রসেসিং)</span>
                      </span>
                    )}

                    {isDelivered && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Delivered (ডেলিভার্ড)</span>
                      </span>
                    )}

                    {isFailed && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                        <span>Failed (ব্যর্থ)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-700 text-[10px] block font-bold">অর্ডার আইডি</span>
                    <span className="font-mono text-black font-extrabold">{order.id}</span>
                  </div>

                  <div>
                    <span className="text-slate-700 text-[10px] block font-bold">প্লেয়ার আইডি (UID)</span>
                    <span className="font-mono text-black font-bold">{order.playerId}</span>
                    {order.zoneId && (
                      <span className="text-[10px] text-slate-800 block font-semibold">({order.zoneId})</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-700 text-[10px] block font-bold">পরিশোধিত মূল্য</span>
                    <span className="font-sans font-extrabold text-black text-sm">৳ {order.price.toFixed(2)}</span>
                  </div>

                  <div>
                    <span className="text-slate-700 text-[10px] block font-bold">অর্ডারের সময়</span>
                    <span className="text-black font-medium">{order.createdAt}</span>
                  </div>
                </div>

                {/* Notes & Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-800 font-medium text-[11px] truncate max-w-md">
                    {order.notes ? (
                      <span>নোট: {order.notes}</span>
                    ) : (
                      <span>স্বয়ংক্রিয় এপিআই গেটওয়ের মাধ্যমে ডেলিভারি প্রক্রিয়া সম্পন্ন হচ্ছে।</span>
                    )}
                  </div>

                  <button
                    id={`view-receipt-${order.id}`}
                    onClick={() => setSelectedReceiptOrder(order)}
                    className="inline-flex items-center gap-1 text-black hover:bg-slate-200 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold self-end sm:self-auto cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-black" />
                    <span>রিসিট দেখুন</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-black" />
                <span className="font-extrabold text-base text-black">অফিশিয়াল পেমেন্ট রিসিট</span>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs shadow-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="text-xs font-extrabold text-black tracking-wider">DC TOP UP BANGLADESH</span>
                <p className="text-[10px] text-slate-800 font-medium">অটোমেটেড ইন-গেম টপ-আপ ইনভয়েস</p>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">ইনভয়েস নং:</span>
                <span className="font-mono font-bold text-black">{selectedReceiptOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">গ্রাহকের নাম:</span>
                <span className="text-black font-bold">{selectedReceiptOrder.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">গেম ও প্যাকেজ:</span>
                <span className="text-black font-bold">{selectedReceiptOrder.productTitle} - {selectedReceiptOrder.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">প্লেয়ার আইডি (UID):</span>
                <span className="font-mono text-black font-extrabold">{selectedReceiptOrder.playerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">স্ট্যাটাস:</span>
                <span className="font-bold capitalize text-emerald-800">{selectedReceiptOrder.status}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold">
                <span className="text-black">মোট কর্তন:</span>
                <span className="text-black font-sans font-extrabold">৳ {selectedReceiptOrder.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-800 text-center font-medium">
              যেকোনো সমস্যায় আমাদের WhatsApp হেল্পলাইনে এই ইনভয়েস নম্বরটি উল্লেখ করুন।
            </div>

            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="w-full py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
