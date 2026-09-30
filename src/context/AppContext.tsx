import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DepositRequest, Order, OrderStatus, TopUpProduct, PaymentMethodType, AppNotice, HomeBanner } from '../types';
import { INITIAL_USER, ADMIN_USER, INITIAL_PRODUCTS, INITIAL_DEPOSITS, INITIAL_ORDERS, INITIAL_NOTICE, INITIAL_BANNERS } from '../data/initialData';

export type ActiveTab = 'home' | 'deposit' | 'orders' | 'profile' | 'login';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  products: TopUpProduct[];
  deposits: DepositRequest[];
  orders: Order[];
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;
  advanceOrderStep: (orderId: string) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  
  // Profile
  updateUserProfile: (updates: Partial<User>) => void;

  // Notice & Announcement
  notice: AppNotice;
  updateNotice: (newNotice: Partial<AppNotice>) => void;

  // Promotional Banners
  banners: HomeBanner[];
  addBanner: (banner: HomeBanner) => void;
  updateBanner: (banner: HomeBanner) => void;
  deleteBanner: (bannerId: string) => void;

  // Auth
  loginWithGoogle: (name?: string, email?: string, photoURL?: string) => void;
  signupWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPhone: (phone: string, name?: string) => void;
  logout: () => void;
  
  // Deposit flow
  submitDeposit: (method: PaymentMethodType, amount: number, senderPhone: string, trxId: string) => Promise<boolean>;
  
  // Purchase flow
  selectedProduct: TopUpProduct | null;
  setSelectedProduct: (p: TopUpProduct | null) => void;
  purchaseProduct: (productId: string, packageId: string, playerId: string, zoneId?: string) => { success: boolean; error?: string; order?: Order };
  
  // Admin actions
  approveDeposit: (depositId: string) => void;
  rejectDeposit: (depositId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  addProduct: (product: TopUpProduct) => void;
  updateProduct: (product: TopUpProduct) => void;
  deleteProduct: (productId: string) => void;
  toggleProductStock: (productId: string) => void;
  togglePackageStock: (productId: string, packageId: string) => void;
  updateProductImage: (productId: string, newImageUrl: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('dc_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<TopUpProduct | null>(null);

  const [products, setProducts] = useState<TopUpProduct[]>(() => {
    const ver = localStorage.getItem('dc_catalog_ver');
    if (ver === 'v7_reliable_images') {
      const saved = localStorage.getItem('dc_products');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    // Refresh to the exact items with matching images requested by the user
    localStorage.setItem('dc_catalog_ver', 'v7_reliable_images');
    localStorage.setItem('dc_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  });

  const [deposits, setDeposits] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('dc_deposits');
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const ver = localStorage.getItem('dc_orders_ver');
    if (ver === 'v2_live_tracking') {
      const saved = localStorage.getItem('dc_orders');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    localStorage.setItem('dc_orders_ver', 'v2_live_tracking');
    localStorage.setItem('dc_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  });

  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(() => {
    return 'ORD-5520';
  });

  const [notice, setNotice] = useState<AppNotice>(() => {
    const saved = localStorage.getItem('dc_notice');
    return saved ? JSON.parse(saved) : INITIAL_NOTICE;
  });

  const [banners, setBanners] = useState<HomeBanner[]>(() => {
    const ver = localStorage.getItem('dc_banners_ver');
    if (ver === 'v7_reliable_images') {
      const saved = localStorage.getItem('dc_banners');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    localStorage.setItem('dc_banners_ver', 'v7_reliable_images');
    localStorage.setItem('dc_banners', JSON.stringify(INITIAL_BANNERS));
    return INITIAL_BANNERS;
  });

  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('dc_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dc_deposits', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('dc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dc_notice', JSON.stringify(notice));
  }, [notice]);

  useEffect(() => {
    localStorage.setItem('dc_banners', JSON.stringify(banners));
  }, [banners]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loginWithGoogle = (name?: string, email?: string, photoURL?: string) => {
    const googleUserEmail = email || 'shayedafride24@gmail.com';
    const googleUserName = name || 'সায়েদ আফ্রিদী';
    const googlePhoto = photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

    try {
      const savedAccountsStr = localStorage.getItem('dc_accounts');
      const accounts: Record<string, User> = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};

      let user: User;
      if (accounts[googleUserEmail]) {
        user = accounts[googleUserEmail];
      } else {
        user = {
          id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
          name: googleUserName,
          email: googleUserEmail,
          photoURL: googlePhoto,
          phone: '01845-735906',
          walletBalance: 420.00,
          role: 'customer',
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0],
          savedGameUid: '2847591028'
        };
        accounts[googleUserEmail] = user;
        localStorage.setItem('dc_accounts', JSON.stringify(accounts));
      }
      setCurrentUser(user);
    } catch {
      const user: User = {
        id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
        name: googleUserName,
        email: googleUserEmail,
        photoURL: googlePhoto,
        phone: '01845-735906',
        walletBalance: 420.00,
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        savedGameUid: '2847591028'
      };
      setCurrentUser(user);
    }
    showToast(`স্বাগতম, ${googleUserName}! Google অ্যাকাউন্ট দিয়ে লগইন সফল হয়েছে।`, 'success');
  };

  const signupWithEmail = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) return { success: false, error: 'আপনার পুরো নাম লিখুন।' };
    if (!email.trim() || !email.includes('@')) return { success: false, error: 'সঠিক ইমেইল ঠিকানা দিন।' };
    if (!password || password.length < 6) return { success: false, error: 'পাসওয়ার্ড খুব দুর্বল, কমপক্ষে ৬ ক্যারেক্টার দিন।' };

    try {
      const savedAccountsStr = localStorage.getItem('dc_accounts');
      const accounts: Record<string, User & { password?: string }> = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};

      const cleanEmail = email.toLowerCase().trim();
      if (accounts[cleanEmail]) {
        return { success: false, error: 'এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।' };
      }

      const newUser: User & { password?: string } = {
        id: 'usr_em_' + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: cleanEmail,
        phone: '017' + Math.floor(10000000 + Math.random() * 90000000),
        walletBalance: 150.00, // Welcome signup bonus
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        savedGameUid: '',
        password: password
      };

      accounts[cleanEmail] = newUser;
      localStorage.setItem('dc_accounts', JSON.stringify(accounts));

      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      showToast(`অভিনন্দন ${name}! আপনার অ্যাকাউন্ট তৈরি হয়েছে এবং লগইন সম্পন্ন হয়েছে।`, 'success');
      return { success: true };
    } catch {
      return { success: false, error: 'অ্যাকাউন্ট তৈরি করা যায়নি, আবার চেষ্টা করুন।' };
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password) return { success: false, error: 'ইমেইল এবং পাসওয়ার্ড পূরণ করুন।' };

    try {
      const savedAccountsStr = localStorage.getItem('dc_accounts');
      const accounts: Record<string, User & { password?: string }> = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};

      const cleanEmail = email.toLowerCase().trim();
      const account = accounts[cleanEmail];

      if (!account) {
        // Create active customer account
        const newUser: User = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: '01712-345678',
          walletBalance: 200.00,
          role: 'customer',
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0],
        };
        accounts[cleanEmail] = { ...newUser, password };
        localStorage.setItem('dc_accounts', JSON.stringify(accounts));
        setCurrentUser(newUser);
        showToast(`স্বাগতম! নতুন অ্যাকাউন্ট সফলভাবে তৈরি ও লগইন হয়েছে।`, 'success');
        return { success: true };
      }

      if (account.password && account.password !== password) {
        return { success: false, error: 'পাসওয়ার্ড সঠিক নয়, আবার চেষ্টা করুন।' };
      }

      const { password: _, ...userWithoutPassword } = account;
      setCurrentUser(userWithoutPassword);
      showToast(`স্বাগতম, ${userWithoutPassword.name}! লগইন সফল হয়েছে।`, 'success');
      return { success: true };
    } catch {
      return { success: false, error: 'লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন।' };
    }
  };

  const loginWithPhone = (phone: string, name?: string) => {
    const user: User = {
      id: 'usr_' + phone.replace(/[^0-9]/g, '').slice(-6),
      name: name || 'গেমার ' + phone.slice(-4),
      phone,
      email: `${phone.replace(/[^0-9]/g, '').slice(-6)}@gamer.bd`,
      walletBalance: 250.00,
      role: 'customer',
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
      savedGameUid: ''
    };
    setCurrentUser(user);
    showToast(`স্বাগতম, ${user.name}! লগইন সফল হয়েছে।`, 'success');
  };

  const logout = () => {
    setCurrentUser(INITIAL_USER);
    setIsAdminMode(false);
    showToast('লগআউট সফল হয়েছে।', 'info');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updates
    }));
    showToast('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!', 'success');
  };

  const submitDeposit = async (method: PaymentMethodType, amount: number, senderPhone: string, trxId: string) => {
    const newDeposit: DepositRequest = {
      id: 'DEP-' + Math.floor(1000 + Math.random() * 9000),
      userId: currentUser.id,
      userName: currentUser.name,
      method,
      amount,
      senderPhone,
      trxId: trxId.trim().toUpperCase(),
      status: 'pending',
      createdAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setDeposits((prev) => [newDeposit, ...prev]);
    showToast('ডিপোজিট রিকোয়েস্ট জমা হয়েছে! এডমিন যাচাই করে ব্যালেন্স যোগ করবেন।', 'success');
    return true;
  };

  const purchaseProduct = (productId: string, packageId: string, playerId: string, zoneId?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'পণ্য খুঁজে পাওয়া যায়নি।' };

    if (product.isOutOfStock) {
      return { success: false, error: 'দুঃখিত, এই প্রোডাক্টটি বর্তমানে স্টক আউট (Out of Stock)।' };
    }

    const pkg = product.packages.find((p) => p.id === packageId);
    if (!pkg) return { success: false, error: 'প্যাকেজ খুঁজে পাওয়া যায়নি।' };

    if (pkg.isOutOfStock) {
      return { success: false, error: `দুঃখিত, '${pkg.name}' প্যাকেজটি বর্তমানে স্টক আউট (Out of Stock)।` };
    }

    if (currentUser.walletBalance < pkg.price) {
      const shortage = pkg.price - currentUser.walletBalance;
      return {
        success: false,
        error: `অপর্যাপ্ত ওয়ালেট ব্যালেন্স! আপনার ঘাটতি আছে ৳ ${shortage.toFixed(2)}। অনুগ্রহ করে টাকা যোগ করুন।`
      };
    }

    // Deduct balance
    const updatedBalance = Number((currentUser.walletBalance - pkg.price).toFixed(2));
    setCurrentUser((prev) => ({
      ...prev,
      walletBalance: updatedBalance,
      savedGameUid: playerId || prev.savedGameUid
    }));

    const serverRef = '#DC-' + Math.floor(100000 + Math.random() * 900000);
    const nowTimeStr = new Date().toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ', ' + new Date().toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });

    // Create Order with initial 'pending' status
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(5000 + Math.random() * 5000),
      userId: currentUser.id,
      userName: currentUser.name,
      productId: product.id,
      productTitle: product.title,
      packageId: pkg.id,
      packageName: `${pkg.name} (${pkg.amount})`,
      price: pkg.price,
      playerId,
      zoneId,
      status: 'pending',
      createdAt: nowTimeStr,
      serverRef,
      estimatedDeliverySeconds: 8,
      notes: 'অর্ডার সিস্টেমে গৃহীত হয়েছে। সার্ভার হ্যান্ডশেকের অপেক্ষায় রয়েছে।'
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingOrderId(newOrder.id);
    showToast(`অর্ডার সফল! ${pkg.name} গৃহীত হয়েছে (Pending)। লাইভ ট্র্যাক হচ্ছে।`, 'success');

    // Real-time Progression: Step 1 (Pending) -> Step 2 (Processing) after 3.2s
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === newOrder.id && ord.status === 'pending'
            ? {
                ...ord,
                status: 'processing',
                processingAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                notes: 'সার্ভার এপিআই এর সাথে কানেক্ট হয়েছে এবং ডায়মন্ড/আইটেম ডিসপ্যাচ করা হচ্ছে...'
              }
            : ord
        )
      );
    }, 3200);

    // Step 2 (Processing) -> Step 3 (Delivered) after 8.2s total
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === newOrder.id && (ord.status === 'pending' || ord.status === 'processing')
            ? {
                ...ord,
                status: 'delivered',
                deliveredAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                notes: `সফলভাবে গেম একাউন্টে পাঠানো হয়েছে! রেফারেন্স: ${serverRef}`
              }
            : ord
        )
      );
    }, 8200);

    return { success: true, order: newOrder };
  };

  const advanceOrderStep = (orderId: string) => {
    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status === 'pending') {
          return {
            ...o,
            status: 'processing',
            processingAt: nowTime,
            notes: 'সার্ভার এপিআই এর সাথে কানেক্ট হয়েছে এবং ডায়মন্ড/আইটেম ডিসপ্যাচ করা হচ্ছে...'
          };
        } else if (o.status === 'processing') {
          return {
            ...o,
            status: 'delivered',
            deliveredAt: nowTime,
            notes: `সফলভাবে একাউন্টে পাঠানো হয়েছে! রেফারেন্স: ${o.serverRef || '#DC-889104'}`
          };
        } else if (o.status === 'delivered') {
          return {
            ...o,
            status: 'pending',
            notes: 'অর্ডার পুনরায় কিউতে যোগ করা হয়েছে।'
          };
        }
        return o;
      })
    );
  };

  const approveDeposit = (depositId: string) => {
    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit) return;

    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              status: 'approved',
              verifiedAt: new Date().toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' })
            }
          : d
      )
    );

    // Single unified data source: credit the customer's wallet balance directly
    setCurrentUser((prev) => {
      const updatedBalance = Number((prev.walletBalance + deposit.amount).toFixed(2));
      return {
        ...prev,
        walletBalance: updatedBalance
      };
    });

    showToast(`ডিপোজিট ${deposit.id} (৳ ${deposit.amount}) অ্যাপ্রুভ করা হয়েছে! ওয়ালেটে টাকা যোগ হয়েছে।`, 'success');
  };

  const rejectDeposit = (depositId: string, reason: string) => {
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              status: 'rejected',
              rejectReason: reason || 'লেনদেন ভেরিফিকেশন ব্যর্থ হয়েছে।',
              verifiedAt: new Date().toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' })
            }
          : d
      )
    );
    showToast(`ডিপোজিট ${depositId} রিজেক্ট করা হয়েছে।`, 'info');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, notes?: string) => {
    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              notes: notes || (status === 'delivered' ? 'ডেলিভারি সম্পন্ন।' : status === 'processing' ? 'সার্ভার প্রসেসিং চলছে...' : status === 'pending' ? 'অপেক্ষমাণ।' : 'ব্যর্থ হয়েছে।'),
              deliveredAt: status === 'delivered' ? nowTime : o.deliveredAt,
              processingAt: status === 'processing' ? nowTime : o.processingAt
            }
          : o
      )
    );
    showToast(`অর্ডার ${orderId} স্ট্যাটাস: ${status.toUpperCase()}`, 'info');
  };

  const addProduct = (product: TopUpProduct) => {
    setProducts((prev) => [product, ...prev]);
    showToast(`নতুন প্রোডাক্ট '${product.title}' যোগ করা হয়েছে!`, 'success');
  };

  const updateProduct = (updatedProduct: TopUpProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    showToast(`প্রোডাক্ট '${updatedProduct.title}' আপডেট করা হয়েছে!`, 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('প্রোডাক্ট মুছে ফেলা হয়েছে।', 'info');
  };

  const toggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newStock = !p.isOutOfStock;
        showToast(
          `প্রোডাক্ট '${p.title}' এখন ${newStock ? 'স্টক আউট (Stock Out)' : 'স্টকে রয়েছে (In Stock)'}!`,
          newStock ? 'info' : 'success'
        );
        return { ...p, isOutOfStock: newStock };
      })
    );
  };

  const togglePackageStock = (productId: string, packageId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedPkgs = p.packages.map((pkg) => {
          if (pkg.id !== packageId) return pkg;
          const newPkgStock = !pkg.isOutOfStock;
          showToast(
            `প্যাকেজ '${pkg.name}' এখন ${newPkgStock ? 'স্টক আউট' : 'স্টকে রয়েছে'}!`,
            newPkgStock ? 'info' : 'success'
          );
          return { ...pkg, isOutOfStock: newPkgStock };
        });
        return { ...p, packages: updatedPkgs };
      })
    );
  };

  const updateProductImage = (productId: string, newImageUrl: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, image: newImageUrl } : p))
    );
    showToast('প্রোডাক্ট ছবি সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
  };

  const updateNotice = (newNotice: Partial<AppNotice>) => {
    setNotice((prev) => ({
      ...prev,
      ...newNotice,
      updatedAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));
    showToast('হোমপেজ নোটিশ সফলভাবে আপডেট হয়েছে!', 'success');
  };

  const addBanner = (banner: HomeBanner) => {
    setBanners((prev) => [banner, ...prev]);
    showToast('নতুন ব্যানার সফলভাবে যোগ করা হয়েছে!', 'success');
  };

  const updateBanner = (updatedBanner: HomeBanner) => {
    setBanners((prev) => prev.map((b) => (b.id === updatedBanner.id ? updatedBanner : b)));
    showToast('ব্যানার সফলভাবে আপডেট হয়েছে!', 'success');
  };

  const deleteBanner = (bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    showToast('ব্যানার রিমুভ করা হয়েছে!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdminMode,
        setIsAdminMode,
        activeTab,
        setActiveTab,
        products,
        deposits,
        orders,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        advanceOrderStep,
        toasts,
        showToast,
        notice,
        updateNotice,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        loginWithGoogle,
        signupWithEmail,
        loginWithEmail,
        loginWithPhone,
        logout,
        updateUserProfile,
        submitDeposit,
        selectedProduct,
        setSelectedProduct,
        purchaseProduct,
        approveDeposit,
        rejectDeposit,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        togglePackageStock,
        updateProductImage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
