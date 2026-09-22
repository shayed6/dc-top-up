import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopUpProduct, TopUpPackage } from '../types';
import { 
  X, AlertTriangle, ShieldCheck, Zap, Wallet, 
  PlusCircle, HelpCircle, CheckCircle2 
} from 'lucide-react';

interface PurchaseModalProps {
  product: TopUpProduct;
  onClose: () => void;
  onGoToDeposit: () => void;
  onGoToOrders: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  product,
  onClose,
  onGoToDeposit,
  onGoToOrders
}) => {
  const { currentUser, purchaseProduct, showToast } = useApp();
  
  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage>(
    product.packages.find((p) => p.popular) || product.packages[0]
  );
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseSuccessOrder, setPurchaseSuccessOrder] = useState<any>(null);
  const [showUidGuide, setShowUidGuide] = useState(false);

  const price = selectedPackage.price;
  const currentBalance = currentUser.walletBalance;
  const isInsufficient = currentBalance < price;
  const shortage = isInsufficient ? price - currentBalance : 0;

  const handleConfirmPurchase = () => {
    if (!playerId || playerId.trim().length < 5) {
      showToast(`অনুগ্রহ করে সঠিক ${product.playerIdLabel} প্রদান করুন।`, 'error');
      return;
    }

    if (product.requiresZoneId && (!zoneId || zoneId.trim().length < 3)) {
      showToast('সঠিক Zone ID প্রদান করুন।', 'error');
      return;
    }

    if (isInsufficient) {
      showToast(`অপর্যাপ্ত ওয়ালেট ব্যালেন্স! আপনার ঘাটতি আছে ৳ ${shortage.toFixed(2)}`, 'error');
      return;
    }

    setIsSubmitting(true);
    const result = purchaseProduct(product.id, selectedPackage.id, playerId.trim(), zoneId.trim());

    if (result.success && result.order) {
      setPurchaseSuccessOrder(result.order);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div 
        id="purchase-modal-container"
        className="w-full max-w-lg bg-white border border-slate-300 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-black"
      >
        {/* Modal Header */}
        <div className="relative p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-black">
                  {product.title}
                </h3>
              </div>
              <p className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-700" />
                <span>অটো ইনস্ট্যান্ট ডেলিভারি</span>
              </p>
            </div>
          </div>

          <button
            id="purchase-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Modal Body */}
        {purchaseSuccessOrder ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-black">অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</h4>
              <p className="text-xs text-slate-800 font-medium">
                অর্ডার আইডি: <span className="font-mono text-black font-extrabold">{purchaseSuccessOrder.id}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">পণ্য ও প্যাকেজ:</span>
                <span className="font-extrabold text-black">{purchaseSuccessOrder.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">প্লেয়ার আইডি:</span>
                <span className="font-mono font-extrabold text-black">{purchaseSuccessOrder.playerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">কাটা হয়েছে:</span>
                <span className="font-extrabold text-black">৳ {purchaseSuccessOrder.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">অবশিষ্ট ওয়ালেট ব্যালেন্স:</span>
                <span className="font-extrabold text-black">৳ {currentUser.walletBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-black text-xs text-left flex items-start gap-2 shadow-xs font-medium">
              <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                আপনার ডায়মন্ড/ইউসি ১-৩ মিনিটের মধ্যে গেম একাউন্টে পৌঁছে যাবে। বর্তমান স্ট্যাটাস 'অর্ডারসমূহ' পেজে ট্র্যাক করুন।
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onGoToOrders}
                className="flex-1 py-3 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                অর্ডার ট্র্যাকিং দেখুন
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs border border-slate-300 cursor-pointer"
              >
                আরও টপ-আপ করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Step 1: In-game UID / Player ID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] flex items-center justify-center font-bold border border-emerald-300">১</span>
                  <span>আপনার {product.playerIdLabel} প্রদান করুন *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowUidGuide(!showUidGuide)}
                  className="text-[11px] text-emerald-800 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>UID কোথায় পাবেন?</span>
                </button>
              </div>

              <input
                id="player-id-input"
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder={`যেমন: 2849182941 (${product.playerIdLabel})`}
                className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
              />

              {product.requiresZoneId && (
                <div className="pt-1">
                  <label className="text-xs font-bold text-black block mb-1">
                    {product.zoneIdLabel || 'Zone ID'} *
                  </label>
                  <input
                    id="zone-id-input"
                    type="text"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder="যেমন: 2049 (Zone ID)"
                    className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
                  />
                </div>
              )}

              {showUidGuide && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-black space-y-1">
                  <p className="font-bold text-black">কিভাবে Player ID পাবেন:</p>
                  <p className="text-slate-800 font-medium">
                    গেম ওপেন করে বামদিকের প্রোফাইল পিকচারে ট্যাপ করুন। নামের নিচে থাকা ৮-১০ ডিজিটের আইডি নম্বরটি কপি করে এখানে পেস্ট করুন।
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Choose Package */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-black flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] flex items-center justify-center font-bold border border-emerald-300">২</span>
                <span>প্যাকেজ নির্বাচন করুন</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {product.packages.map((pkg) => {
                  const isSelected = selectedPackage.id === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      id={`package-btn-${pkg.id}`}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-slate-50 border-black text-black shadow-xs ring-2 ring-black'
                          : 'bg-white border-slate-300 text-black hover:bg-slate-50'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-400 text-black shadow-xs">
                          জনপ্রিয়
                        </span>
                      )}

                      <div className="font-bold text-xs sm:text-sm text-black flex items-center gap-1">
                        <span>{pkg.amount}</span>
                      </div>

                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-black font-sans">
                          ৳ {pkg.price}
                        </span>
                        {pkg.originalPrice && (
                          <span className="text-[10px] text-slate-500 line-through">
                            ৳ {pkg.originalPrice}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Wallet Balance & Payment Summary */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-300">
                    <img src="/dc_logo.jpg" alt="DC Wallet" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-black block">ডিসি গেমিং ওয়ালেট (DC Wallet)</span>
                    <span className="text-[10px] text-emerald-800 font-bold">ইনস্ট্যান্ট পেমেন্ট ও ১-৩ মিনিটে অটো ডেলিভারি</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-medium flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-black" />
                    <span>আপনার বর্তমান ব্যালেন্স:</span>
                  </span>
                  <span className="font-extrabold font-sans text-black">৳ {currentBalance.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-medium">প্যাকেজের মূল্য:</span>
                  <span className="font-extrabold font-sans text-black">৳ {price.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-semibold">
                  <span className="text-black font-bold">লেনদেন পরবর্তী ব্যালেন্স:</span>
                  <span className={`font-sans font-extrabold ${isInsufficient ? 'text-rose-700' : 'text-black'}`}>
                    {isInsufficient ? `ঘাটতি ৳ ${shortage.toFixed(2)}` : `৳ ${(currentBalance - price).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Insufficient Balance Notice & Prompt */}
              {isInsufficient && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs space-y-3 animate-in fade-in shadow-xs">
                  <div className="flex items-start gap-2 text-rose-950 font-medium">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">অপর্যাপ্ত ওয়ালেট ব্যালেন্স!</span>
                      <span>
                        এই প্যাকেজটি কিনতে আরও <span className="font-extrabold text-black font-mono">৳ {shortage.toFixed(2)}</span> টাকা প্রয়োজন।
                      </span>
                    </div>
                  </div>

                  <button
                    id="insufficient-add-money-btn"
                    onClick={() => {
                      onClose();
                      onGoToDeposit();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>টাকা যোগ করুন (Add ৳{Math.ceil(shortage)})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Confirm Purchase Action */}
            <div className="pt-2">
              <button
                id="confirm-purchase-btn"
                type="button"
                disabled={isInsufficient || isSubmitting}
                onClick={handleConfirmPurchase}
                className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-[0.99] cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {isInsufficient
                    ? 'অপর্যাপ্ত ব্যালেন্স - টাকা যোগ করুন'
                    : `ওয়ালেট দিয়ে অর্ডার কনফার্ম করুন (৳ ${price})`}
                </span>
              </button>
              <p className="text-center text-[11px] text-slate-800 font-medium mt-2">
                অর্ডার নিশ্চিত করার সাথে সাথে ওয়ালেট থেকে ৳ {price} কর্তন করা হবে।
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
