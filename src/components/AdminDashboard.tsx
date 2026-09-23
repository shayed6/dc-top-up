import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DepositRequest, TopUpProduct, TopUpPackage, ProductCategory, HomeBanner } from '../types';
import { PRESET_PRODUCT_IMAGES } from '../data/initialData';
import { 
  Clock, CheckCircle2, XCircle, 
  Users, ShoppingBag, Package, Plus, Trash2, AlertCircle, 
  Search, Copy, Check, DollarSign, RefreshCw, Image as ImageIcon,
  Megaphone, Flame, Info, AlertTriangle, Sparkles, ExternalLink,
  ArrowRight, Tag, Eye, CheckSquare
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
    toggleProductStock,
    togglePackageStock,
    updateProductImage,
    notice,
    updateNotice,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    showToast,
    resetToSampleData
  } = useApp();

  const [currentAdminTab, setCurrentAdminTab] = useState<
    'pending_deposits' | 'all_deposits' | 'products' | 'notices_banners' | 'orders'
  >('pending_deposits');

  // Reject deposit modal state
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('ভুল TrxID বা অ্যাকাউন্টে কোনো টাকা পাওয়া যায়নি।');

  // Product Image change modal state
  const [editingImageProduct, setEditingImageProduct] = useState<TopUpProduct | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Add package to existing product state
  const [addingPackageToProduct, setAddingPackageToProduct] = useState<TopUpProduct | null>(null);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgAmount, setNewPkgAmount] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');

  // Add new product modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('gaming');
  const [newProductSubCategory, setNewProductSubCategory] = useState('BD Server');
  const [newProductBadge, setNewProductBadge] = useState('নতুন অফার 🔥');
  const [newProductPlayerIdLabel, setNewProductPlayerIdLabel] = useState('Player ID (UID)');
  const [newProductImageUrl, setNewProductImageUrl] = useState('/src/assets/images/ff_friday_offer_1790099054219.jpg');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newPackageList, setNewPackageList] = useState<Array<{ name: string; amount: string; price: number; popular: boolean }>>([
    { name: '115 Diamonds', amount: '115 💎', price: 85, popular: true }
  ]);

  // Notice state in admin form
  const [noticeDraftText, setNoticeDraftText] = useState(notice.text);
  const [noticeDraftType, setNoticeDraftType] = useState<'urgent' | 'offer' | 'warning' | 'info'>(notice.type);
  const [noticeDraftIsActive, setNoticeDraftIsActive] = useState(notice.isActive);

  // Banner modal state
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImageUrl, setNewBannerImageUrl] = useState('/src/assets/images/ff_friday_offer_1790099054219.jpg');
  const [newBannerBadge, setNewBannerBadge] = useState('স্পেশাল অফার');
  const [newBannerActionText, setNewBannerActionText] = useState('টাকা যোগ করুন');
  const [newBannerActionTab, setNewBannerActionTab] = useState<'deposit' | 'orders' | 'home'>('deposit');

  // TrxID copied feedback
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);

  // Search in deposits
  const [depositSearch, setDepositSearch] = useState('');
  const [depositFilterStatus, setDepositFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Search & Filter in products
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'gaming' | 'tiktok' | 'facebook'>('all');

  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const approvedDeposits = deposits.filter((d) => d.status === 'approved');

  const totalPendingDeposits = pendingDeposits.length;
  const todayApprovedAmount = approvedDeposits.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCompletedOrders = orders.filter((o) => o.status === 'delivered').length;

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

  // Filtered deposits for All Deposits tab
  const filteredAllDeposits = deposits.filter((d) => {
    if (depositFilterStatus !== 'all' && d.status !== depositFilterStatus) return false;
    if (!depositSearch) return true;
    const q = depositSearch.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.trxId.toLowerCase().includes(q) ||
      d.senderPhone.toLowerCase().includes(q) ||
      d.userName.toLowerCase().includes(q)
    );
  });

  // Filtered products for Products tab
  const filteredAdminProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all') {
      if (productCategoryFilter === 'gaming' && p.category !== 'gaming' && p.category !== 'games') return false;
      if (productCategoryFilter === 'tiktok' && p.category !== 'tiktok') return false;
      if (productCategoryFilter === 'facebook' && p.category !== 'facebook') return false;
    }
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
      p.packages.some((pkg) => pkg.name.toLowerCase().includes(q))
    );
  });

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
            ডিপোজিট, প্রোডাক্ট প্রাইসিং, হোম নোটিশ ও ব্যানার
          </h2>
          <p className="text-xs text-slate-800 mt-0.5 font-medium">
            প্রোডাক্ট স্টক আউট, নতুন ছবি ও প্যাকেজ যুক্ত করুন, এবং হোমপেজের নোটিশ ও ব্যানার নিয়ন্ত্রণ করুন।
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
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">পেন্ডিং ডিপোজিট</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-950 font-sans">{totalPendingDeposits} টি</p>
          <span className="text-[11px] text-amber-800 font-semibold block">যাচাইয়ের অপেক্ষায়</span>
        </div>

        {/* Stat 2: Today Approved Deposits */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">অনুমোদিত ডিপোজিট</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-950 font-sans">৳ {todayApprovedAmount.toFixed(0)}</p>
          <span className="text-[11px] text-emerald-800 font-semibold block">{approvedDeposits.length} টি সফল ট্রানজেকশন</span>
        </div>

        {/* Stat 3: Orders Completed */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">ডেলিভারড অর্ডার</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-950 font-sans">{totalCompletedOrders} টি</p>
          <span className="text-[11px] text-blue-800 font-semibold block">সরাসরি গেম আইডিতে ডেলিভারি</span>
        </div>

        {/* Stat 4: Active Products */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">মোট প্রোডাক্ট</span>
            <Package className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl font-extrabold text-black font-sans">{products.length} টি</p>
          <span className="text-[11px] text-slate-700 font-semibold block">
            {products.filter((p) => p.isOutOfStock).length} টি স্টক আউট
          </span>
        </div>
      </div>

      {/* Main Control Panel Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Navigation Tabs Header */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100 p-1.5 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            id="admin-tab-pending-btn"
            onClick={() => setCurrentAdminTab('pending_deposits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'pending_deposits'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>পেন্ডিং ডিপোজিট</span>
            {totalPendingDeposits > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {totalPendingDeposits}
              </span>
            )}
          </button>

          <button
            id="admin-tab-all-deposits-btn"
            onClick={() => setCurrentAdminTab('all_deposits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'products'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>প্রোডাক্ট ও প্রাইসিং ({products.length})</span>
          </button>

          <button
            id="admin-tab-notices-banners-btn"
            onClick={() => setCurrentAdminTab('notices_banners')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'notices_banners'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>হোম নোটিশ ও ব্যানার ({banners.length})</span>
          </button>

          <button
            id="admin-tab-orders-btn"
            onClick={() => setCurrentAdminTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
                            ৳ {dep.amount}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-700 font-bold">প্রেরক নম্বর: </span>
                          <span className="font-mono font-extrabold text-black">{dep.senderPhone}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-700 font-bold">TrxID: </span>
                          <span className="font-mono font-extrabold text-black bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            {dep.trxId}
                          </span>
                          <button
                            onClick={() => handleCopyTrx(dep.trxId)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-800 transition-colors cursor-pointer"
                            title="TrxID কপি করুন"
                          >
                            {copiedTrx === dep.trxId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div>
                          <span className="text-slate-700 font-bold">সময়: </span>
                          <span className="text-slate-800 font-semibold">{dep.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                      <button
                        id={`approve-btn-${dep.id}`}
                        onClick={() => approveDeposit(dep.id)}
                        className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>অ্যাপ্রুভ ও টাকা যোগ করুন</span>
                      </button>

                      <button
                        id={`reject-btn-${dep.id}`}
                        onClick={() => setRejectingDeposit(dep)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-300 hover:border-rose-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>বাতিল</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Deposits */}
        {currentAdminTab === 'all_deposits' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="TrxID, নম্বর বা আইডি দিয়ে খুঁজুন..."
                  value={depositSearch}
                  onChange={(e) => setDepositSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black shadow-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setDepositFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                      depositFilterStatus === st
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'all'
                      ? 'সব'
                      : st === 'pending'
                      ? 'পেন্ডিং'
                      : st === 'approved'
                      ? 'অনুমোদিত'
                      : 'বাতিল'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">আইডি ও গেটওয়ে</th>
                    <th className="p-3">গ্রাহক</th>
                    <th className="p-3">প্রেরক নম্বর</th>
                    <th className="p-3">TrxID</th>
                    <th className="p-3">টাকার পরিমাণ</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3">তারিখ ও সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAllDeposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-black flex items-center gap-1.5">
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded text-white font-extrabold ${
                            dep.method === 'bkash'
                              ? 'bg-[#D82365]'
                              : dep.method === 'nagad'
                              ? 'bg-[#F25822]'
                              : 'bg-[#8C3494]'
                          }`}
                        >
                          {dep.method}
                        </span>
                        <span>{dep.id}</span>
                      </td>
                      <td className="p-3 font-semibold text-black">{dep.userName}</td>
                      <td className="p-3 font-mono text-black font-semibold">{dep.senderPhone}</td>
                      <td className="p-3 font-mono font-bold text-black select-all">{dep.trxId}</td>
                      <td className="p-3 font-extrabold text-black font-sans">৳ {dep.amount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            dep.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : dep.status === 'pending'
                              ? 'bg-amber-100 text-amber-950 border border-amber-300'
                              : 'bg-rose-100 text-rose-950 border border-rose-300'
                          }`}
                        >
                          {dep.status === 'approved'
                            ? 'Approved'
                            : dep.status === 'pending'
                            ? 'Pending'
                            : 'Rejected'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{dep.createdAt}</td>
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-black flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>টপ-আপ প্রোডাক্ট, ছবি পরিবর্তন ও স্টক আউট কন্ট্রোল</span>
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  যেকোনো প্রোডাক্টের ছবি পরিবর্তন করুন, সরাসরি 'স্টক আউট' করুন, নতুন প্যাকেজ যোগ করুন এবং বিক্রয়মূল্য নিয়ন্ত্রণ করুন।
                </p>
              </div>

              <button
                id="admin-add-product-btn"
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all self-start lg:self-auto shadow-md cursor-pointer transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন প্রোডাক্ট যোগ করুন</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="প্রোডাক্টের নাম বা প্যাকেজ দিয়ে খুঁজুন..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black shadow-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {(['all', 'gaming', 'tiktok', 'facebook'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                      productCategoryFilter === cat
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all'
                      ? 'সবগুলো'
                      : cat === 'gaming'
                      ? 'গেমিং'
                      : cat === 'tiktok'
                      ? 'টিকটক'
                      : 'ফেসবুক'}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAdminProducts.map((prod) => (
                <div
                  key={prod.id}
                  id={`admin-product-item-${prod.id}`}
                  className={`p-4 rounded-xl bg-white border transition-all space-y-3.5 shadow-xs ${
                    prod.isOutOfStock ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail & Image Change Trigger */}
                      <div className="relative group shrink-0">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-xs"
                        />
                        <button
                          onClick={() => {
                            setEditingImageProduct(prod);
                            setCustomImageUrl(prod.image);
                          }}
                          className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 text-[9px] font-bold text-center"
                          title="ছবি পরিবর্তন করুন"
                        >
                          <ImageIcon className="w-3.5 h-3.5 mb-0.5" />
                          <span>ছবি পাল্টান</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-sm text-black">{prod.title}</h4>
                          {prod.isOutOfStock && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white uppercase tracking-wider">
                              স্টক আউট
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-700">
                          <span className="font-bold uppercase tracking-wider text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                            {prod.category}
                          </span>
                          {prod.subCategory && (
                            <span className="text-slate-800 font-medium">({prod.subCategory})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock & Action Controls */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* Product Stock Out Switch */}
                      <button
                        onClick={() => toggleProductStock(prod.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer flex items-center gap-1 ${
                          prod.isOutOfStock
                            ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-xs'
                            : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                        }`}
                        title="ক্লিক করে পণ্যটি স্টক আউট অথবা ইন স্টক করুন"
                      >
                        <span className={`w-2 h-2 rounded-full ${prod.isOutOfStock ? 'bg-white' : 'bg-emerald-600'}`} />
                        <span>{prod.isOutOfStock ? 'স্টক আউট' : 'ইন স্টক'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Change Image Button */}
                        <button
                          onClick={() => {
                            setEditingImageProduct(prod);
                            setCustomImageUrl(prod.image);
                          }}
                          className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black flex items-center gap-1 cursor-pointer"
                          title="ছবি পরিবর্তন করুন"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>ছবি</span>
                        </button>

                        {/* Active Switch */}
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

                        {/* Delete Product */}
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি '${prod.title}' মুছে ফেলতে চান?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Packages Table inside Product */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">
                        প্যাকেজসমূহ ও বিক্রয়মূল্য (৳):
                      </span>
                      <button
                        onClick={() => {
                          setAddingPackageToProduct(prod);
                          setNewPkgName('');
                          setNewPkgAmount('');
                          setNewPkgPrice('');
                        }}
                        className="text-[10px] text-emerald-800 font-extrabold hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                      >
                        <Plus className="w-3 h-3" />
                        <span>প্যাকেজ যোগ করুন</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {prod.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                            pkg.isOutOfStock
                              ? 'bg-rose-50/50 border-rose-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-black font-bold">{pkg.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({pkg.amount})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Package Stock Out Toggle Button */}
                            <button
                              onClick={() => togglePackageStock(prod.id, pkg.id)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                                pkg.isOutOfStock
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                              }`}
                              title="প্যাকেজ স্টক আউট টগল করুন"
                            >
                              {pkg.isOutOfStock ? 'স্টক আউট' : 'স্টকে আছে'}
                            </button>

                            {/* Price Input */}
                            <div className="flex items-center gap-1">
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
                                className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-sans font-extrabold text-black text-xs"
                              />
                              <span className="text-[10px] text-slate-700 font-bold">৳</span>
                            </div>

                            {/* Remove Package if more than 1 */}
                            {prod.packages.length > 1 && (
                              <button
                                onClick={() => {
                                  const updatedPkgs = prod.packages.filter((p) => p.id !== pkg.id);
                                  updateProduct({ ...prod, packages: updatedPkgs });
                                  showToast('প্যাকেজ মুছে ফেলা হয়েছে।', 'info');
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="প্যাকেজ মুছে ফেলুন"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
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

        {/* Tab 4: Notices & Banners Management */}
        {currentAdminTab === 'notices_banners' && (
          <div className="p-4 sm:p-5 space-y-8">
            {/* Section 1: Homepage Announcement Notice */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-rose-600" />
                    <span>হোমপেজ জরুরি নোটিশ / ঘোষণা পাঠানো অপশন</span>
                  </h3>
                  <p className="text-xs text-slate-800 font-medium">
                    গ্রাহকরা অ্যাপ ওপেন করার সাথে সাথে হোমপেজের শীর্ষে এই নোটিশটি দেখতে পাবেন।
                  </p>
                </div>

                {/* Notice Active Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">নোটিশ স্ট্যাটাস:</span>
                  <button
                    onClick={() => setNoticeDraftIsActive(!noticeDraftIsActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
                      noticeDraftIsActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${noticeDraftIsActive ? 'bg-white' : 'bg-slate-500'}`} />
                    <span>{noticeDraftIsActive ? 'সক্রিয় (অন)' : 'বন্ধ (অফ)'}</span>
                  </button>
                </div>
              </div>

              {/* Notice Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-black block">নোটিশের ধরন (Theme / Badge):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNoticeDraftType('urgent')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      noticeDraftType === 'urgent'
                        ? 'bg-rose-50 border-rose-600 text-rose-950 ring-2 ring-rose-500'
                        : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    <Megaphone className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>জরুরি নোটিশ 🚨</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoticeDraftType('offer')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      noticeDraftType === 'offer'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 ring-2 ring-amber-500'
                        : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>স্পেশাল অফার 🔥</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoticeDraftType('warning')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      noticeDraftType === 'warning'
                        ? 'bg-orange-50 border-orange-600 text-orange-950 ring-2 ring-orange-500'
                        : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>ওয়ার্নিং বার্তা ⚠️</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoticeDraftType('info')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      noticeDraftType === 'info'
                        ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500'
                        : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>অফিসিয়াল ঘোষণা 📢</span>
                  </button>
                </div>
              </div>

              {/* Notice Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-black block">নোটিশ বার্তা (Text):</label>
                <textarea
                  rows={3}
                  value={noticeDraftText}
                  onChange={(e) => setNoticeDraftText(e.target.value)}
                  placeholder="যেমন: ফ্রাইডে স্পেশাল অফারে ১০০% বোনাস ডায়মন্ড চালু হয়েছে! বিকাশ ও নগদে দ্রুত রিচার্জ করুন।"
                  className="w-full bg-white border border-slate-300 focus:border-black rounded-xl p-3 text-sm text-black shadow-xs focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-xl bg-white border border-slate-300 space-y-1.5 shadow-xs">
                <span className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
                  হোমপেজে যেভাবে দেখা যাবে (Live Preview):
                </span>
                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    noticeDraftType === 'urgent'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : noticeDraftType === 'offer'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : noticeDraftType === 'warning'
                      ? 'bg-orange-50 border-orange-300 text-orange-950'
                      : 'bg-blue-50 border-blue-300 text-blue-950'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      noticeDraftType === 'urgent'
                        ? 'bg-rose-600 text-white'
                        : noticeDraftType === 'offer'
                        ? 'bg-amber-500 text-black'
                        : noticeDraftType === 'warning'
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/10">
                      {noticeDraftType === 'urgent'
                        ? 'জরুরি নোটিশ 🚨'
                        : noticeDraftType === 'offer'
                        ? 'স্পেশাল অফার 🔥'
                        : noticeDraftType === 'warning'
                        ? 'ওয়ার্নিং বার্তা ⚠️'
                        : 'অফিসিয়াল ঘোষণা 📢'}
                    </span>
                    <p className="text-xs sm:text-sm font-bold mt-0.5">
                      {noticeDraftText || 'নোটিশের লেখা এখানে প্রদর্শিত হবে...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Notice Button */}
              <button
                onClick={() => {
                  updateNotice({
                    text: noticeDraftText,
                    type: noticeDraftType,
                    isActive: noticeDraftIsActive
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>নোটিশ সেভ ও প্রকাশ করুন</span>
              </button>
            </div>

            {/* Section 2: Promotional Banners Manager */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>হোমপেজ ব্যানার ম্যানেজমেন্ট (Hero Slider Banners)</span>
                  </h3>
                  <p className="text-xs text-slate-800 font-medium">
                    হোমপেজের স্লাইডারে প্রদর্শিত প্রমোশনাল ব্যানার যোগ, সচল/বন্ধ অথবা রিমুভ করুন।
                  </p>
                </div>

                <button
                  id="admin-add-banner-btn"
                  onClick={() => setShowAddBannerModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ব্যানার যোগ করুন</span>
                </button>
              </div>

              {/* Banners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-4 bg-white space-y-3 shadow-xs transition-all ${
                      b.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Visual Banner Preview Card */}
                    <div className="relative h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent p-3 flex flex-col justify-between text-white">
                        <div>
                          {b.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-extrabold uppercase">
                              {b.badge}
                            </span>
                          )}
                          <h4 className="font-extrabold text-sm text-white mt-1 line-clamp-1">
                            {b.title}
                          </h4>
                          {b.subtitle && (
                            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                              {b.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white text-black text-[9px] font-extrabold flex items-center gap-1">
                            <span>{b.actionText || 'বাটন'}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Banner Action Bar */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-bold">স্ট্যাটাস:</span>
                        <button
                          onClick={() => updateBanner({ ...b, isActive: !b.isActive })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                            b.isActive
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {b.isActive ? 'সক্রিয়' : 'বন্ধ'}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি '${b.title}' ব্যানারটি রিমুভ করতে চান?`)) {
                            deleteBanner(b.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>রিমুভ করুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Orders Queue */}
        {currentAdminTab === 'orders' && (
          <div className="p-4 sm:p-5 space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-black flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>গ্রাহক টপ-আপ ডেলিভারি ও প্রসেসিং কিউ</span>
            </h3>

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
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                    {ord.status === 'pending' && (
                      <>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                          Pending
                        </span>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'processing', 'এডমিন থেকে প্রসেসিং কিউতে পাঠানো হয়েছে।')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Processing এ দিন</span>
                        </button>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered', 'এডমিন দ্বারা সরাসরি ডেলিভারি সম্পন্ন।')}
                          className="px-2.5 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Delivered</span>
                        </button>
                      </>
                    )}

                    {ord.status === 'processing' && (
                      <>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-950 border border-blue-300">
                          Processing
                        </span>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered', 'সরাসরি গেটওয়ে দিয়ে ডেলিভারি সম্পন্ন।')}
                          className="px-3 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered করুন</span>
                        </button>
                      </>
                    )}

                    {ord.status === 'delivered' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Delivered সম্পন্ন</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Deposit Modal */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-sm text-black">ডিপোজিট রিজেক্ট নিশ্চিতকরণ</h3>
            </div>

            <p className="text-xs text-slate-800 font-medium">
              আইডি: <strong className="font-mono text-black">{rejectingDeposit.id}</strong> | পরিমাণ:{' '}
              <strong className="text-black font-sans font-extrabold">৳ {rejectingDeposit.amount}</strong>
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-800 font-bold block">রিজেক্ট করার কারণ:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-black shadow-xs focus:outline-none"
              />
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

      {/* Product Image Changer Modal */}
      {editingImageProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-black">
                  প্রোডাক্ট ছবি পরিবর্তন করুন ({editingImageProduct.title})
                </h3>
              </div>
              <button
                onClick={() => setEditingImageProduct(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            {/* Live Preview */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={customImageUrl || editingImageProduct.image}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover border border-slate-300 shadow-xs"
              />
              <div className="text-xs space-y-1">
                <span className="font-extrabold text-black block">বর্তমান প্রিভিউ</span>
                <span className="text-slate-600 break-all text-[11px] block line-clamp-2">
                  {customImageUrl || editingImageProduct.image}
                </span>
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-800 font-bold block">কাস্টম ইমেজ লিংক (URL):</label>
              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs text-xs"
              />
            </div>

            {/* Preset Images Gallery */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-800 font-bold block">
                অথবা প্রস্তুতকৃত আর্টওয়ার্ক থেকে ১-ক্লিকে নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomImageUrl(preset.url)}
                    className={`p-1.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      customImageUrl === preset.url
                        ? 'border-black bg-white ring-2 ring-black'
                        : 'border-slate-300 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0"
                    />
                    <span className="text-[10px] font-bold text-black truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!customImageUrl) {
                    showToast('অনুগ্রহ করে সঠিক ছবির লিংক দিন বা প্রিসেট বেছে নিন।', 'error');
                    return;
                  }
                  updateProductImage(editingImageProduct.id, customImageUrl);
                  setEditingImageProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                ছবি সেভ করুন
              </button>
              <button
                onClick={() => setEditingImageProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Package to Existing Product Modal */}
      {addingPackageToProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>নতুন প্যাকেজ যোগ ({addingPackageToProduct.title})</span>
              </h3>
              <button
                onClick={() => setAddingPackageToProduct(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">প্যাকেজের নাম *</label>
                <input
                  type="text"
                  placeholder="যেমন: 530 Diamonds বা 300 UC"
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">অ্যামাউন্ট ও আইকন</label>
                <input
                  type="text"
                  placeholder="যেমন: 530 💎 বা 300 🪙"
                  value={newPkgAmount}
                  onChange={(e) => setNewPkgAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">বিক্রয়মূল্য (৳) *</label>
                <input
                  type="number"
                  placeholder="যেমন: 380"
                  value={newPkgPrice}
                  onChange={(e) => setNewPkgPrice(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-sans shadow-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const price = parseFloat(newPkgPrice);
                  if (!newPkgName || isNaN(price) || price <= 0) {
                    showToast('সঠিক প্যাকেজ নাম ও মূল্য প্রদান করুন।', 'error');
                    return;
                  }
                  const newPkg: TopUpPackage = {
                    id: 'pkg_' + Date.now(),
                    name: newPkgName,
                    amount: newPkgAmount || newPkgName,
                    price: price,
                    instantDelivery: true
                  };
                  updateProduct({
                    ...addingPackageToProduct,
                    packages: [...addingPackageToProduct.packages, newPkg]
                  });
                  setAddingPackageToProduct(null);
                  showToast('নতুন প্যাকেজ সফলভাবে যোগ হয়েছে!', 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                প্যাকেজ যুক্ত করুন
              </button>
              <button
                onClick={() => setAddingPackageToProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Full Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>নতুন টপ-আপ প্রোডাক্ট যোগ করুন</span>
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">গেম বা কার্ডের নাম *</label>
                <input
                  type="text"
                  value={newProductTitle}
                  onChange={(e) => setNewProductTitle(e.target.value)}
                  placeholder="যেমন: FC Mobile Points বা Honor of Kings Tokens"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ক্যাটেগরি *</label>
                  <select
                    value={newProductCategory}
                    onChange={(e: any) => setNewProductCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-semibold"
                  >
                    <option value="gaming">গেম অফার ও মেম্বারশিপ (Gaming)</option>
                    <option value="tiktok">টিকটক সার্ভিস (TikTok)</option>
                    <option value="facebook">ফেসবুক সার্ভিস (Facebook)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">সাব-ক্যাটেগরি / টাইপ</label>
                  <input
                    type="text"
                    value={newProductSubCategory}
                    onChange={(e) => setNewProductSubCategory(e.target.value)}
                    placeholder="যেমন: BD Server বা Special Offer"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">প্লেয়ার আইডি লেবেল *</label>
                  <input
                    type="text"
                    value={newProductPlayerIdLabel}
                    onChange={(e) => setNewProductPlayerIdLabel(e.target.value)}
                    placeholder="Player ID (UID)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">ব্যাজ (Badge Tag)</label>
                  <input
                    type="text"
                    value={newProductBadge}
                    onChange={(e) => setNewProductBadge(e.target.value)}
                    placeholder="নতুন সংযুক্ত 🔥"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                  />
                </div>
              </div>

              {/* Image Selection with Presets */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-black block">প্রোডাক্টের কভার ছবি</span>
                  <img
                    src={newProductImageUrl}
                    alt="Preview"
                    className="w-8 h-8 rounded-lg object-cover border border-slate-300"
                  />
                </div>
                <input
                  type="text"
                  value={newProductImageUrl}
                  onChange={(e) => setNewProductImageUrl(e.target.value)}
                  placeholder="ছবির লিঙ্ক (URL)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-black"
                />

                <span className="text-[10px] text-slate-700 font-bold block">বা প্রস্তুতকৃত ছবি থেকে বেছে নিন:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {PRESET_PRODUCT_IMAGES.slice(0, 8).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewProductImageUrl(p.url)}
                      className={`shrink-0 p-1 rounded-lg border flex items-center gap-1 cursor-pointer ${
                        newProductImageUrl === p.url ? 'border-black bg-white ring-1 ring-black' : 'border-slate-300 bg-white'
                      }`}
                    >
                      <img src={p.url} alt="" className="w-5 h-5 rounded object-cover" />
                      <span className="text-[9px] font-bold text-black">{p.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Starter Packages Builder */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-black block">প্যাকেজসমূহ ও বিক্রয়মূল্য</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPackageList([
                        ...newPackageList,
                        { name: 'প্যাকেজ নাম', amount: '100 Credits', price: 150, popular: false }
                      ]);
                    }}
                    className="text-[10px] text-emerald-800 font-extrabold hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-300"
                  >
                    <Plus className="w-3 h-3" />
                    <span>প্যাকেজ যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newPackageList.map((pkg, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1.5 items-center bg-white p-2 rounded-lg border border-slate-200">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="প্যাকেজ নাম"
                          value={pkg.name}
                          onChange={(e) => {
                            const updated = [...newPackageList];
                            updated[idx].name = e.target.value;
                            setNewPackageList(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-black font-semibold text-xs"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="অ্যামাউন্ট"
                          value={pkg.amount}
                          onChange={(e) => {
                            const updated = [...newPackageList];
                            updated[idx].amount = e.target.value;
                            setNewPackageList(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-black text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="মূল্য ৳"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = [...newPackageList];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setNewPackageList(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-black font-sans font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        {newPackageList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewPackageList(newPackageList.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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
                  const newProd: TopUpProduct = {
                    id: 'prod_' + Date.now(),
                    title: newProductTitle,
                    category: newProductCategory,
                    subCategory: newProductSubCategory,
                    badge: newProductBadge || 'নতুন অফার 🔥',
                    description: newProductDescription || `${newProductTitle} সরাসরি ${newProductPlayerIdLabel} দিয়ে দ্রুত টপ-আপ করুন।`,
                    playerIdLabel: newProductPlayerIdLabel,
                    image: newProductImageUrl || '/src/assets/images/ff_friday_offer_1790099054219.jpg',
                    bannerGradient: 'from-blue-600/30 to-purple-950/60',
                    isActive: true,
                    isOutOfStock: false,
                    packages: newPackageList.map((p, i) => ({
                      id: 'pkg_' + Date.now() + '_' + i,
                      name: p.name,
                      amount: p.amount,
                      price: p.price,
                      popular: p.popular,
                      instantDelivery: true
                    }))
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

      {/* Add New Banner Modal */}
      {showAddBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>নতুন হোমপেজ ব্যানার যোগ করুন</span>
              </h3>
              <button
                onClick={() => setShowAddBannerModal(false)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">ব্যানার শিরোনাম (Title) *</label>
                <input
                  type="text"
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="যেমন: শুক্রবারের স্পেশাল ডাবল ডায়মন্ড অফার 🔥"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-bold shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">সাবটাইটেল / বিবরণ</label>
                <input
                  type="text"
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  placeholder="যেমন: আজকের ডিপোজিটে বিকাশ ও নগদে পাচ্ছেন অতিরিক্ত ছাড় ও ইনস্ট্যান্ট ডেলিভারি।"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ব্যাজ ট্যাগ</label>
                  <input
                    type="text"
                    value={newBannerBadge}
                    onChange={(e) => setNewBannerBadge(e.target.value)}
                    placeholder="ফ্রাইডে স্পেশাল"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">বাটন অ্যাকশন</label>
                  <select
                    value={newBannerActionTab}
                    onChange={(e: any) => setNewBannerActionTab(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-semibold shadow-xs"
                  >
                    <option value="deposit">ডিপোজিট পেজে যাবে (টাকা যোগ)</option>
                    <option value="orders">অর্ডার কিউতে যাবে</option>
                    <option value="home">হোম প্রোডাক্টে স্ক্রল করবে</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">বাটন টেক্সট</label>
                <input
                  type="text"
                  value={newBannerActionText}
                  onChange={(e) => setNewBannerActionText(e.target.value)}
                  placeholder="টাকা যোগ করুন"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              {/* Banner Image with Presets */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-black block">ব্যানার ব্যাকগ্রাউন্ড ছবি</span>
                  <img
                    src={newBannerImageUrl}
                    alt="Preview"
                    className="w-12 h-7 rounded object-cover border border-slate-300"
                  />
                </div>
                <input
                  type="text"
                  value={newBannerImageUrl}
                  onChange={(e) => setNewBannerImageUrl(e.target.value)}
                  placeholder="ছবির লিংক (URL)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-black"
                />

                <span className="text-[10px] text-slate-700 font-bold block">বা ছবি নির্বাচন করুন:</span>
                <div className="grid grid-cols-3 gap-1.5 max-h-28 overflow-y-auto">
                  {PRESET_PRODUCT_IMAGES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewBannerImageUrl(p.url)}
                      className={`p-1 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer ${
                        newBannerImageUrl === p.url ? 'border-black bg-white ring-1 ring-black' : 'border-slate-300 bg-white'
                      }`}
                    >
                      <img src={p.url} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="text-[9px] font-bold text-black truncate">{p.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!newBannerTitle) {
                    showToast('ব্যানারের শিরোনাম প্রদান করুন।', 'error');
                    return;
                  }
                  const banner: HomeBanner = {
                    id: 'banner_' + Date.now(),
                    title: newBannerTitle,
                    subtitle: newBannerSubtitle,
                    badge: newBannerBadge || 'স্পেশাল অফার',
                    imageUrl: newBannerImageUrl || '/src/assets/images/ff_friday_offer_1790099054219.jpg',
                    actionTab: newBannerActionTab,
                    actionText: newBannerActionText || 'বিস্তারিত দেখুন',
                    isActive: true
                  };
                  addBanner(banner);
                  setShowAddBannerModal(false);
                  setNewBannerTitle('');
                  setNewBannerSubtitle('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                ব্যানার প্রকাশ করুন
              </button>
              <button
                onClick={() => setShowAddBannerModal(false)}
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
