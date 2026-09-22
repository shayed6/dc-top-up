import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DepositRequest, TopUpProduct, ProductCategory } from '../types';
import { 
  Clock, CheckCircle2, XCircle, 
  Users, ShoppingBag, Package, Plus, Trash2, AlertCircle, 
  Search, Copy, Check, DollarSign, RefreshCw 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    deposits, 
    orders, 
    products, 
    approveDeposit, 
    rejectDeposit, 
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast,
    resetToSampleData
  } = useApp();

  const [currentAdminTab, setCurrentAdminTab] = useState<
    'pending_deposits' | 'all_deposits' | 'products' | 'orders'
  >('pending_deposits');

  // Reject modal state
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('ভুল TrxID বা অ্যাকাউন্টে কোনো টাকা পাওয়া যায়নি।');

  // Product modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('games');
  const [newProductPlayerIdLabel, setNewProductPlayerIdLabel] = useState('Player ID (UID)');
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageAmount, setNewPackageAmount] = useState('');
  const [newPackagePrice, setNewPackagePrice] = useState('');

  // TrxID copied feedback
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);

  // Search in deposits
  const [depositSearch, setDepositSearch] = useState('');

  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const approvedDeposits = deposits.filter((d) => d.status === 'approved');

  const totalPendingDeposits = pendingDeposits.length;
  const todayApprovedAmount = approvedDeposits.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCompletedOrders = orders.filter((o) => o.status === 'delivered').length;
  const totalOrdersCount = orders.length;
  const totalUsersCount = 142; // Sample realistic marketplace user count

  const handleCopyTrx = (trx: string) => {
    navigator.clipboard.writeText(trx);
    setCopiedTrx(trx);
    showToast(`TrxID ${trx} কপি করা হয়েছে!`, 'success');
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const handleConfirmReject = () => {
    if (!rejectingDeposit) return;
    rejectDeposit(rejectingDeposit.id, rejectReason);
    setRejectingDeposit(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 bg-white text-black">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-black border border-slate-300 text-xs font-bold uppercase tracking-wider">
              এডমিন কন্ট্রোল প্যানেল
            </span>
            <span className="text-xs text-slate-800 font-semibold">DC Top Up Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-black mt-1">
            ডিপোজিট ভেরিফিকেশন ও প্রোডাক্ট ম্যানেজমেন্ট
          </h2>
          <p className="text-xs text-slate-800 mt-0.5 font-medium">
            গ্রাহকের পাঠানো বিকাশ, নগদ ও রকেট TrxID যাচাই করে ওয়ালেট ব্যালেন্স অনুমোদন দিন।
          </p>
        </div>

        <button
          onClick={resetToSampleData}
          className="self-start md:self-center px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-black border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ডেমো ডেটা রিসেট</span>
        </button>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Pending Deposits */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
            <span>পেন্ডিং ডিপোজিট</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-black font-sans flex items-baseline gap-2">
            <span>{totalPendingDeposits}</span>
            {totalPendingDeposits > 0 && (
              <span className="text-xs font-bold text-amber-700">অনুমোদন প্রয়োজন</span>
            )}
          </div>
          <p className="text-[11px] text-slate-700 font-medium">যাচাইয়ের অপেক্ষায় থাকা লেনদেন</p>
        </div>

        {/* Stat 2: Today's Approved Amount */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
            <span>মোট অনুমোদিত টাকা</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-black font-sans">
            ৳ {todayApprovedAmount.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-700 font-medium">সফলভাবে ওয়ালেটে যুক্ত হওয়া ফান্ড</p>
        </div>

        {/* Stat 3: Completed Orders */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
            <span>মোট অর্ডার ডেলিভার্ড</span>
            <ShoppingBag className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-black font-sans">
            {totalCompletedOrders} / {totalOrdersCount}
          </div>
          <p className="text-[11px] text-slate-700 font-medium">সফল গেম টপ-আপ ডেলিভারি</p>
        </div>

        {/* Stat 4: Total Users */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
            <span>নিবন্ধিত গেমার ইউজার</span>
            <Users className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-black font-sans">
            {totalUsersCount}+
          </div>
          <p className="text-[11px] text-slate-700 font-medium">সক্রিয় বাংলাদেশি গ্রাহক</p>
        </div>
      </div>

      {/* Main Admin Content with Tabs */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-1 p-2 overflow-x-auto bg-slate-50">
          <button
            id="admin-tab-pending-btn"
            onClick={() => setCurrentAdminTab('pending_deposits')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'pending_deposits'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>পেন্ডিং ডিপোজিট ({totalPendingDeposits})</span>
          </button>

          <button
            id="admin-tab-all-deposits-btn"
            onClick={() => setCurrentAdminTab('all_deposits')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'all_deposits'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>সব ট্রানজেকশন ({deposits.length})</span>
          </button>

          <button
            id="admin-tab-products-btn"
            onClick={() => setCurrentAdminTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'products'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>প্রোডাক্ট ও প্রাইসিং ({products.length})</span>
          </button>

          <button
            id="admin-tab-orders-btn"
            onClick={() => setCurrentAdminTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'orders'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>গ্রাহক অর্ডার কিউ ({orders.length})</span>
          </button>
        </div>

        {/* Tab 1: Pending Deposits */}
        {currentAdminTab === 'pending_deposits' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-black flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>অপেক্ষমাণ ডিপোজিট ভেরিফিকেশন তালিকা</span>
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  গ্রাহকের TrxID ও প্রেরক নম্বর আপনার বিকাশ/নগদ স্টেটমেন্টের সাথে মিলিয়ে অ্যাপ্রুভ অথবা রিজেক্ট করুন।
                </p>
              </div>
            </div>

            {pendingDeposits.length === 0 ? (
              <div className="p-10 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <p className="font-extrabold text-sm text-black">কোনো পেন্ডিং ডিপোজিট নেই!</p>
                <p className="text-xs text-slate-800 font-medium">
                  সব ট্রানজেকশন সফলভাবে যাচাই করা হয়েছে। নতুন কোনো রিকোয়েস্ট আসলে এখানে তালিকাভুক্ত হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    id={`admin-pending-${dep.id}`}
                    className="p-4 rounded-xl bg-white border border-slate-300 hover:border-slate-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded text-white ${
                            dep.method === 'bkash'
                              ? 'bg-[#D82365]'
                              : dep.method === 'nagad'
                              ? 'bg-[#F25822]'
                              : 'bg-[#8C3494]'
                          }`}
                        >
                          {dep.method}
                        </span>
                        <span className="font-mono font-extrabold text-sm text-black">{dep.id}</span>
                        <span className="text-xs text-slate-800 font-bold">({dep.userName})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <div>
                          <span className="text-slate-700 font-bold">টাকার পরিমাণ: </span>
                          <span className="font-extrabold text-base text-black font-sans">
                            ৳ {dep.amount.toFixed(2)}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-700 font-bold">প্রেরক নম্বর: </span>
                          <span className="font-mono text-black font-extrabold">{dep.senderPhone}</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          <span className="text-slate-700 font-bold">TrxID: </span>
                          <span className="font-mono font-extrabold text-black tracking-wider">
                            {dep.trxId}
                          </span>
                          <button
                            onClick={() => handleCopyTrx(dep.trxId)}
                            className="text-black hover:text-slate-600 ml-1 cursor-pointer"
                            title="TrxID কপি করুন"
                          >
                            {copiedTrx === dep.trxId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div>
                          <span className="text-slate-700 font-bold">সময়: </span>
                          <span className="text-black font-medium">{dep.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Approve / Reject */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                      <button
                        id={`approve-btn-${dep.id}`}
                        onClick={() => approveDeposit(dep.id)}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>অ্যাপ্রুভ (টাকা যোগ করুন)</span>
                      </button>

                      <button
                        id={`reject-btn-${dep.id}`}
                        onClick={() => {
                          setRejectingDeposit(dep);
                          setRejectReason('ভুল TrxID বা অ্যাকাউন্টে কোনো টাকা পাওয়া যায়নি।');
                        }}
                        className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>রিজেক্ট</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Deposits & Audit Log */}
        {currentAdminTab === 'all_deposits' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-extrabold text-sm text-black">সম্পূর্ণ ডিপোজিট ট্রানজেকশন হিস্টোরি</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
                <input
                  type="text"
                  value={depositSearch}
                  onChange={(e) => setDepositSearch(e.target.value)}
                  placeholder="TrxID বা ফোন নম্বর খুঁজুন..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-black placeholder-slate-500 shadow-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-extrabold">
                    <th className="py-2.5 px-3">আইডি ও মেথড</th>
                    <th className="py-2.5 px-3">গ্রাহক ও প্রেরক নম্বর</th>
                    <th className="py-2.5 px-3">TrxID</th>
                    <th className="py-2.5 px-3">পরিমাণ</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {deposits
                    .filter(
                      (d) =>
                        d.trxId.toLowerCase().includes(depositSearch.toLowerCase()) ||
                        d.senderPhone.includes(depositSearch) ||
                        d.id.toLowerCase().includes(depositSearch.toLowerCase())
                    )
                    .map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <span className="font-mono font-extrabold text-black block">{d.id}</span>
                          <span className="uppercase text-[10px] text-slate-700 font-bold">{d.method}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-black font-bold block">{d.userName}</span>
                          <span className="font-mono text-slate-800">{d.senderPhone}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-extrabold text-black">
                          {d.trxId}
                        </td>
                        <td className="py-3 px-3 font-sans font-extrabold text-black">
                          ৳ {d.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          {d.status === 'approved' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-bold">
                              Approved
                            </span>
                          )}
                          {d.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold">
                              Pending
                            </span>
                          )}
                          {d.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-950 border border-rose-300 text-[10px] font-bold">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-800">{d.createdAt}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Products Management */}
        {currentAdminTab === 'products' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-black">টপ-আপ প্রোডাক্ট ও প্যাকেজ মূল্য নির্ধারণ</h3>
                <p className="text-xs text-slate-800 font-medium">
                  যেকোনো পণ্যের মূল্য সরাসরি পরিবর্তন করুন যা তাৎক্ষণিক মার্কেটপ্লেসে আপডেট হবে।
                </p>
              </div>

              <button
                id="admin-add-product-btn"
                onClick={() => setShowAddProductModal(true)}
                className="px-3.5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন গেম বা প্রোডাক্ট যোগ করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  id={`admin-product-item-${prod.id}`}
                  className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-300"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-black">{prod.title}</h4>
                        <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">
                          ক্যাটেগরি: {prod.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const updated = { ...prod, isActive: !prod.isActive };
                          updateProduct(updated);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          prod.isActive
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : 'bg-slate-200 text-black'
                        }`}
                      >
                        {prod.isActive ? 'সক্রিয়' : 'বন্ধ'}
                      </button>

                      <button
                        onClick={() => deleteProduct(prod.id)}
                        className="p-1.5 text-black hover:text-rose-600 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Packages Table inside Product */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      প্যাকেজসমূহ ও বিক্রয়মূল্য (৳):
                    </span>
                    <div className="space-y-1">
                      {prod.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200"
                        >
                          <span className="text-black font-bold">{pkg.name}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              defaultValue={pkg.price}
                              onBlur={(e) => {
                                const newPrice = parseFloat(e.target.value);
                                if (!isNaN(newPrice) && newPrice > 0) {
                                  const updatedPkgs = prod.packages.map((p) =>
                                    p.id === pkg.id ? { ...p, price: newPrice } : p
                                  );
                                  updateProduct({ ...prod, packages: updatedPkgs });
                                }
                              }}
                              className="w-20 bg-white border border-slate-300 rounded px-2 py-0.5 text-right font-sans font-extrabold text-black text-xs"
                            />
                            <span className="text-[10px] text-slate-700 font-bold">টাকা</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Orders Queue */}
        {currentAdminTab === 'orders' && (
          <div className="p-4 sm:p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-black">গ্রাহক টপ-আপ ডেলিভারি ও প্রসেসিং কিউ</h3>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-black text-sm">{ord.id}</span>
                      <span className="font-extrabold text-black">{ord.productTitle}</span>
                      <span className="text-slate-800 font-semibold">({ord.packageName})</span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 text-slate-700 font-medium">
                      <span>গ্রাহক: <strong className="text-black">{ord.userName}</strong></span>
                      <span>UID: <strong className="font-mono text-black font-extrabold">{ord.playerId}</strong></span>
                      <span>মূল্য: <strong className="text-black font-sans font-extrabold">৳ {ord.price}</strong></span>
                      <span>সময়: {ord.createdAt}</span>
                    </div>
                  </div>

                  {/* Order Status & Actions */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                    {ord.status === 'processing' ? (
                      <>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered', 'সরাসরি গেটওয়ে দিয়ে ডেলিভারি সম্পন্ন।')}
                          className="px-3 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ডেলিভারি সম্পন্ন করুন</span>
                        </button>

                        <button
                          onClick={() => updateOrderStatus(ord.id, 'failed', 'সার্ভারে গেম আইডি পাওয়া যায়নি।')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
                        >
                          ব্যর্থ মার্ক করুন
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : 'bg-rose-100 text-rose-950 border border-rose-300'
                        }`}
                      >
                        {ord.status === 'delivered' ? '✓ Delivered' : '✗ Failed'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal with Reason Field */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-extrabold">
                <AlertCircle className="w-5 h-5" />
                <span>ডিপোজিট রিজেক্ট করার কারণ উল্লেখ করুন</span>
              </div>
              <button
                onClick={() => setRejectingDeposit(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বাতিল
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-800 font-medium">
                ডিপোজিট আইডি: <strong className="font-mono text-black font-extrabold">{rejectingDeposit.id}</strong> | পরিমাণ: <strong className="text-black font-sans font-extrabold">৳ {rejectingDeposit.amount}</strong>
              </p>

              <div>
                <label className="text-slate-700 font-bold block mb-1">প্রত্যাখ্যানের সুনির্দিষ্ট কারণ (গ্রাহক দেখতে পাবেন):</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-300 focus:border-black rounded-xl p-3 text-black text-xs focus:outline-none shadow-xs"
                  placeholder="যেমন: প্রদত্ত TrxID ভুয়া অথবা কোনো টাকা পাঠানো হয়নি।"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'ভুল TrxID',
                  'টাকা জমা হয়নি',
                  'প্রেরক নম্বর মেলেনি',
                  'ডুপ্লিকেট TrxID'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(`${reason}। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় সাবমিট করুন।`)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-black font-bold border border-slate-300 cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
              >
                নিশ্চিত রিজেক্ট করুন
              </button>
              <button
                onClick={() => setRejectingDeposit(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-black" />
                <span>নতুন টপ-আপ প্রোডাক্ট যোগ করুন</span>
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">গেম বা কার্ডের নাম *</label>
                <input
                  type="text"
                  value={newProductTitle}
                  onChange={(e) => setNewProductTitle(e.target.value)}
                  placeholder="যেমন: EA Sports FC Mobile Points"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ক্যাটেগরি</label>
                  <select
                    value={newProductCategory}
                    onChange={(e: any) => setNewProductCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-medium"
                  >
                    <option value="gaming">গেম অফার ও মেম্বারশিপ (Gaming)</option>
                    <option value="tiktok">টিকটক সার্ভিস (TikTok)</option>
                    <option value="facebook">ফেসবুক সার্ভিস (Facebook)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">আইডি লেবেল</label>
                  <input
                    type="text"
                    value={newProductPlayerIdLabel}
                    onChange={(e) => setNewProductPlayerIdLabel(e.target.value)}
                    placeholder="Player ID (UID)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <span className="font-extrabold text-black block">প্রাথমিক স্টার্টার প্যাকেজ</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="প্যাকেজ নাম (100 Points)"
                    value={newPackageName}
                    onChange={(e) => setNewPackageName(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-black shadow-xs"
                  />
                  <input
                    type="text"
                    placeholder="অ্যামাউন্ট (100 ⚽)"
                    value={newPackageAmount}
                    onChange={(e) => setNewPackageAmount(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-black shadow-xs"
                  />
                  <input
                    type="number"
                    placeholder="মূল্য ৳ (যেমন: 120)"
                    value={newPackagePrice}
                    onChange={(e) => setNewPackagePrice(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-black font-sans shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!newProductTitle) {
                    showToast('প্রোডাক্টের নাম লিখুন।', 'error');
                    return;
                  }
                  const price = parseFloat(newPackagePrice) || 99;
                  const newProd: TopUpProduct = {
                    id: 'prod_' + Date.now(),
                    title: newProductTitle,
                    category: newProductCategory,
                    badge: 'নতুন সংযুক্ত 🔥',
                    description: `${newProductTitle} সরাসরি প্লেয়ার আইডি দিয়ে দ্রুত টপ-আপ করুন।`,
                    playerIdLabel: newProductPlayerIdLabel,
                    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
                    bannerGradient: 'from-blue-600/30 to-purple-950/60',
                    isActive: true,
                    packages: [
                      {
                        id: 'pkg_' + Date.now(),
                        name: newPackageName || 'স্ট্যান্ডার্ড প্যাকেজ',
                        amount: newPackageAmount || '100 Credits',
                        price: price,
                        popular: true,
                        instantDelivery: true
                      }
                    ]
                  };
                  addProduct(newProd);
                  setShowAddProductModal(false);
                  setNewProductTitle('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                প্রোডাক্ট পাবলিশ করুন
              </button>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
