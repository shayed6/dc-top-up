import { TopUpProduct, DepositRequest, Order, User, PaymentAccountInfo } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_88017',
  name: 'সায়েদ আফ্রিদী',
  phone: '01712-345678',
  walletBalance: 420.00,
  role: 'user',
  joinedAt: '2025-01-15'
};

export const ADMIN_USER: User = {
  id: 'usr_admin_01',
  name: 'DC Admin (ম্যানেজার)',
  phone: '01800-000000',
  walletBalance: 99999.00,
  role: 'admin',
  joinedAt: '2024-11-01'
};

export const PAYMENT_ACCOUNTS: Record<'bkash' | 'nagad' | 'rocket', PaymentAccountInfo> = {
  bkash: {
    method: 'bkash',
    name: 'bKash Personal (বিকাশ পার্সোনাল)',
    number: '01874-291048',
    type: 'Personal',
    color: '#D82365', // Authentic bKash pink accent
    instructions: [
      'আপনার বিকাশ অ্যাপ অথবা *247# ডায়াল করে "Send Money" (সেন্ড মানি) অপশন বেছে নিন।',
      'প্রাপক নম্বর হিসেবে আমাদের পার্সোনাল নম্বরটি লিখুন: 01874-291048',
      'কাঙ্ক্ষিত পরিমাণ টাকা ও আপনার গোপন পিন দিয়ে ট্রানজেকশন সফল করুন।',
      'এসএমএস (SMS) বা অ্যাপ থেকে ৮-১০ ডিজিটের Transaction ID (TrxID) টি কপি করে নিচের বক্সে দিন।'
    ]
  },
  nagad: {
    method: 'nagad',
    name: 'Nagad Personal (নগদ পার্সোনাল)',
    number: '01723-884912',
    type: 'Personal',
    color: '#F25822', // Authentic Nagad orange accent
    instructions: [
      'আপনার নগদ অ্যাপ অথবা *167# ডায়াল করে "Send Money" অপশন সিলেক্ট করুন।',
      'প্রাপক নম্বর হিসেবে আমাদের নগদ নম্বরটি লিখুন: 01723-884912',
      'টাকার পরিমাণ ও পিন দিয়ে কনফার্ম করুন (নগদে ক্যাশ-আউট নয়, শুধু সেন্ড মানি)।',
      'প্রাপ্ত ৮ ডিজিটের TrxID টি এবং আপনার যে নম্বর থেকে পাঠিয়েছেন তা দিয়ে সাবমিট করুন।'
    ]
  },
  rocket: {
    method: 'rocket',
    name: 'Rocket Personal (রকেট পার্সোনাল)',
    number: '01911-382910-4',
    type: 'Personal',
    color: '#8C3494', // Authentic Rocket purple accent
    instructions: [
      'আপনার রকেট অ্যাপ অথবা *322# ডায়াল করে "Send Money" অপশনে যান।',
      'আমাদের ১২ ডিজিটের রকেট একাউন্ট নম্বর দিন: 01911-382910-4',
      'টাকা পাঠিয়ে ট্রানজেকশন আইডি (TxnID) সংরক্ষণ করুন।',
      'নিচের ফর্মে প্রেরক নম্বর ও TxnID দিয়ে সাবমিট রিকোয়েস্ট করুন।'
    ]
  }
};

export const INITIAL_PRODUCTS: TopUpProduct[] = [
  {
    id: 'freefire',
    title: 'Free Fire Top-Up (UID)',
    category: 'games',
    subCategory: 'Battle Royale',
    badge: 'ইনস্ট্যান্ট ডেলিভারি (১-২ মিনিট)',
    description: 'শুধু প্লেয়ার আইডি (UID) দিয়ে ডায়মন্ড নিন। ১০০% আইডি নিরাপদ ও অফিসিয়াল রিসিট সহ।',
    playerIdLabel: 'Player ID (UID)',
    image: '/dc_logo.jpg',
    bannerGradient: 'from-amber-600/30 to-rose-950/40',
    isActive: true,
    packages: [
      { id: 'ff_25', name: '25 Diamonds', amount: '25 💎', price: 23, originalPrice: 25 },
      { id: 'ff_50', name: '50 Diamonds', amount: '50 💎', price: 44, originalPrice: 48 },
      { id: 'ff_115', name: '115 Diamonds', amount: '115 💎', price: 85, originalPrice: 95, popular: true, instantDelivery: true },
      { id: 'ff_240', name: '240 Diamonds', amount: '240 💎', price: 175, originalPrice: 190, instantDelivery: true },
      { id: 'ff_610', name: '610 Diamonds', amount: '610 💎', price: 425, originalPrice: 460, popular: true, instantDelivery: true },
      { id: 'ff_1240', name: '1240 Diamonds', amount: '1,240 💎', price: 840, originalPrice: 920 },
      { id: 'ff_weekly', name: 'Weekly Membership', amount: 'সাপ্তাহিক মেম্বারশিপ', price: 195, originalPrice: 220, instantDelivery: true },
      { id: 'ff_monthly', name: 'Monthly Membership', amount: 'মাসিক মেম্বারশিপ', price: 890, originalPrice: 950 }
    ]
  },
  {
    id: 'pubg',
    title: 'PUBG Mobile Global UC',
    category: 'games',
    subCategory: 'Battle Royale',
    badge: 'অফার রেট 🔥',
    description: 'গ্লোবাল সার্ভার ইউসি সরাসরি আপনার ক্যারেক্টার আইডি তে টপ-আপ হবে।',
    playerIdLabel: 'Character ID (UID)',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    bannerGradient: 'from-yellow-600/30 to-slate-900/60',
    isActive: true,
    packages: [
      { id: 'pubg_60', name: '60 UC', amount: '60 UC', price: 95, originalPrice: 105, instantDelivery: true },
      { id: 'pubg_325', name: '325 UC', amount: '325 UC', price: 475, originalPrice: 510, popular: true },
      { id: 'pubg_660', name: '660 UC (Royale Pass)', amount: '660 UC', price: 940, originalPrice: 990, instantDelivery: true },
      { id: 'pubg_1800', name: '1800 UC', amount: '1,800 UC', price: 2450, originalPrice: 2600 }
    ]
  },
  {
    id: 'mlbb',
    title: 'Mobile Legends: Bang Bang',
    category: 'games',
    subCategory: 'MOBA',
    badge: 'অটো টপ-আপ',
    description: 'ইউজার আইডি এবং জোন আইডি দিন। সর্বোচ্চ ৩ মিনিটে ডায়মন্ড পেয়ে যাবেন।',
    playerIdLabel: 'User ID',
    requiresZoneId: true,
    zoneIdLabel: 'Zone ID (4-5 Digits)',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    bannerGradient: 'from-indigo-600/30 to-slate-950/60',
    isActive: true,
    packages: [
      { id: 'ml_86', name: '86 Diamonds', amount: '86 💎', price: 145, originalPrice: 160 },
      { id: 'ml_172', name: '172 Diamonds', amount: '172 💎', price: 285, originalPrice: 310 },
      { id: 'ml_pass', name: 'Weekly Diamond Pass', amount: 'উইকলি ডায়মন্ড পাস', price: 195, originalPrice: 215, popular: true, instantDelivery: true },
      { id: 'ml_257', name: '257 Diamonds', amount: '257 💎', price: 420, originalPrice: 450 },
      { id: 'ml_706', name: '706 Diamonds', amount: '706 💎', price: 1130, originalPrice: 1200 }
    ]
  },
  {
    id: 'codm',
    title: 'Call of Duty: Mobile (CP)',
    category: 'games',
    subCategory: 'FPS',
    badge: 'সেরা প্রাইস',
    description: 'সিওডিএম গ্যারেনা ও গ্লোবাল সিপিসমূহ সুলভ মূল্যে নিশ্চিত ডেলিভারি।',
    playerIdLabel: 'CODM OpenID / UID',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    bannerGradient: 'from-emerald-600/25 to-slate-950/60',
    isActive: true,
    packages: [
      { id: 'codm_80', name: '80 CP', amount: '80 CP', price: 92, originalPrice: 100 },
      { id: 'codm_420', name: '420 CP', amount: '420 CP', price: 440, originalPrice: 470, popular: true },
      { id: 'codm_880', name: '880 CP', amount: '880 CP', price: 890, originalPrice: 950 }
    ]
  },
  {
    id: 'valorant',
    title: 'Valorant Points (India/BD)',
    category: 'games',
    subCategory: 'FPS',
    badge: 'অফিসিয়াল পিন কোড',
    description: 'রiot আইডি দিয়ে ডাইরেক্ট অথবা রিডিম কোড এর মাধ্যমে ভ্যালোরেন্ট পয়েন্ট নিন।',
    playerIdLabel: 'Riot ID (e.g. Player#BD1)',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    bannerGradient: 'from-rose-600/30 to-purple-950/60',
    isActive: true,
    packages: [
      { id: 'val_475', name: '475 VP', amount: '475 VP', price: 450, originalPrice: 480 },
      { id: 'val_1000', name: '1000 VP', amount: '1,000 VP', price: 890, originalPrice: 940, popular: true },
      { id: 'val_2050', name: '2050 VP', amount: '2,050 VP', price: 1750, originalPrice: 1850 }
    ]
  },
  {
    id: 'steam_wallet',
    title: 'Steam Wallet Code (Global / USD)',
    category: 'wallet',
    subCategory: 'Gaming Wallet',
    badge: 'ইনস্ট্যান্ট কোড ⚡',
    description: 'গ্লোবাল স্টিম ওয়ালেট ডিজিটাল রিডিম কোড। যেকোনো পিসি গেম ও আইটেম কেনার জন্য প্রযোজ্য।',
    playerIdLabel: 'ইমেইল অথবা ফোন নম্বর (কোড ডেলিভারির জন্য)',
    image: 'https://images.unsplash.com/photo-1618193139062-2c5bf4f935b7?auto=format&fit=crop&w=600&q=80',
    bannerGradient: 'from-blue-600/30 to-slate-950/70',
    isActive: true,
    packages: [
      { id: 'steam_5', name: '$5 Steam Wallet USD', amount: '$5 কোড', price: 620, originalPrice: 660, instantDelivery: true },
      { id: 'steam_10', name: '$10 Steam Wallet USD', amount: '$10 কোড', price: 1240, originalPrice: 1300, popular: true, instantDelivery: true },
      { id: 'steam_20', name: '$20 Steam Wallet USD', amount: '$20 কোড', price: 2460, originalPrice: 2580, instantDelivery: true }
    ]
  },
  {
    id: 'razer_gold',
    title: 'Razer Gold PIN (Global / BD)',
    category: 'wallet',
    subCategory: 'Gaming Wallet',
    badge: 'ইউনিভার্সাল ওয়ালেট',
    description: 'রেজার গোল্ড পিন দিয়ে শত শত অনলাইন গেম ও প্ল্যাটফর্মে সরাসরি কয়েন রিচার্জ করুন।',
    playerIdLabel: 'ফোন নম্বর (এসএমএস পিন ডেলিভারির জন্য)',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    bannerGradient: 'from-emerald-600/30 to-slate-950/70',
    isActive: true,
    packages: [
      { id: 'razer_5', name: '$5 Razer Gold PIN', amount: '$5 পিন', price: 615, originalPrice: 650, instantDelivery: true },
      { id: 'razer_10', name: '$10 Razer Gold PIN', amount: '$10 পিন', price: 1230, originalPrice: 1290, popular: true, instantDelivery: true }
    ]
  },
  {
    id: 'googleplay',
    title: 'Google Play Gift Card (US)',
    category: 'giftcard',
    subCategory: 'Gift Card',
    badge: 'ডিজিটাল কোড',
    description: 'ইউএস রিজিয়ন প্লে স্টোর গিফট কার্ড। রিডিম কোড তাৎক্ষণিক এসএমএস ও অর্ডারে দেখা যাবে।',
    playerIdLabel: 'ইমেইল বা ফোন নম্বর (কোড পাঠানোর জন্য)',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    bannerGradient: 'from-cyan-600/30 to-blue-950/60',
    isActive: true,
    packages: [
      { id: 'gp_5', name: '$5 USD Gift Card', amount: '$5 কার্ড', price: 610, originalPrice: 650 },
      { id: 'gp_10', name: '$10 USD Gift Card', amount: '$10 কার্ড', price: 1220, originalPrice: 1280, popular: true }
    ]
  },
  {
    id: 'apple_giftcard',
    title: 'Apple App Store & iTunes Gift Card (US)',
    category: 'giftcard',
    subCategory: 'Gift Card',
    badge: 'অফিসিয়াল অ্যাপল কোড',
    description: 'আইফোন ও আইপ্যাডের জন্য অ্যাপল ইউএস গিফট কার্ড। অ্যাপ ও ইন-অ্যাপ ক্রয়ে ব্যবহারযোগ্য।',
    playerIdLabel: 'ইমেইল বা ফোন নম্বর (কোড ডেলিভারি)',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
    bannerGradient: 'from-purple-600/30 to-slate-950/70',
    isActive: true,
    packages: [
      { id: 'apple_5', name: '$5 Apple Gift Card', amount: '$5 কার্ড', price: 625, originalPrice: 670, instantDelivery: true },
      { id: 'apple_10', name: '$10 Apple Gift Card', amount: '$10 কার্ড', price: 1250, originalPrice: 1320, popular: true, instantDelivery: true }
    ]
  }
];

export const INITIAL_DEPOSITS: DepositRequest[] = [
  {
    id: 'DEP-8841',
    userId: 'usr_88017',
    userName: 'সায়েদ আফ্রিদী',
    method: 'bkash',
    amount: 500,
    senderPhone: '01712-345678',
    trxId: 'BKL891J29P',
    status: 'approved',
    createdAt: '2025-02-20 14:32',
    verifiedAt: '2025-02-20 14:35'
  },
  {
    id: 'DEP-9023',
    userId: 'usr_88017',
    userName: 'সায়েদ আফ্রিদী',
    method: 'nagad',
    amount: 250,
    senderPhone: '01833-918231',
    trxId: 'NG772183AA',
    status: 'pending',
    createdAt: '2025-02-21 10:15'
  },
  {
    id: 'DEP-7731',
    userId: 'usr_guest_4',
    userName: 'তানভীর হাসান',
    method: 'bkash',
    amount: 1000,
    senderPhone: '01923-112233',
    trxId: 'BKX109923K',
    status: 'pending',
    createdAt: '2025-02-21 09:40'
  },
  {
    id: 'DEP-6629',
    userId: 'usr_88017',
    userName: 'সায়েদ আফ্রিদী',
    method: 'rocket',
    amount: 100,
    senderPhone: '01712-345678',
    trxId: 'RCK0019283',
    status: 'rejected',
    rejectReason: 'প্রদত্ত TrxID সঠিক নয় অথবা কোনো টাকা জমা হয়নি। অনুগ্রহ করে সঠিক TrxID দিয়ে পুনরায় চেষ্টা করুন।',
    createdAt: '2025-02-18 19:10',
    verifiedAt: '2025-02-18 19:22'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-5491',
    userId: 'usr_88017',
    userName: 'সায়েদ আফ্রিদী',
    productId: 'freefire',
    productTitle: 'Free Fire Top-Up (UID)',
    packageId: 'ff_115',
    packageName: '115 Diamonds (115 💎)',
    price: 85,
    playerId: '2849182941',
    status: 'delivered',
    createdAt: '2025-02-20 14:40',
    deliveredAt: '2025-02-20 14:42',
    notes: 'Success - Garena Ref: #GR-992104'
  },
  {
    id: 'ORD-5502',
    userId: 'usr_88017',
    userName: 'সায়েদ আফ্রিদী',
    productId: 'pubg',
    productTitle: 'PUBG Mobile Global UC',
    packageId: 'pubg_60',
    packageName: '60 UC',
    price: 95,
    playerId: '5192841920',
    status: 'processing',
    createdAt: '2025-02-21 11:05',
    notes: 'সার্ভারে ভেরিফাই হচ্ছে, সর্বোচ্চ ৫ মিনিটের মধ্যে একাউন্টে যোগ হবে।'
  }
];
