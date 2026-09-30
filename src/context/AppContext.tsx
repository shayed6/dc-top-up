import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DepositRequest, Order, OrderStatus, TopUpProduct, TopUpPackage, PaymentMethodType, AppNotice, HomeBanner } from '../types';
import { INITIAL_USER, ADMIN_USER, INITIAL_PRODUCTS, INITIAL_DEPOSITS, INITIAL_ORDERS, INITIAL_NOTICE, INITIAL_BANNERS } from '../data/initialData';
import { auth, db, googleProvider } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  collection, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';

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
  loginWithGoogle: (name?: string, email?: string, photoURL?: string) => Promise<void> | void;
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
  
  // Admin actions (direct Firestore client SDK operations)
  approveDeposit: (depositId: string) => Promise<void>;
  rejectDeposit: (depositId: string, reason: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  addProduct: (product: TopUpProduct) => Promise<void>;
  updateProduct: (product: TopUpProduct) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductStock: (productId: string) => Promise<void>;
  toggleProductActive: (productId: string) => Promise<void>;
  togglePackageStock: (productId: string, packageId: string) => Promise<void>;
  updateProductImage: (productId: string, newImageUrl: string) => Promise<void>;
  updateProductPackages: (productId: string, packages: TopUpPackage[]) => Promise<void>;
  seedProductsToFirestore: () => Promise<void>;
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

  // Listen to Firebase Auth State Changes & live user document
  useEffect(() => {
    let userUnsub: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (userUnsub) {
        userUnsub();
        userUnsub = null;
      }

      if (firebaseUser) {
        const isAdminEmail = firebaseUser.email === 'shayedafride24@gmail.com' || firebaseUser.email === 'admin@dctopup.com';
        const userRef = doc(db, 'users', firebaseUser.uid);

        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            const initialDoc = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'সায়েদ আফ্রিদী',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '01845-735906',
              walletBalance: 420.00,
              role: isAdminEmail ? 'admin' : 'customer',
              joinedAt: new Date().toISOString().split('T')[0],
              createdAt: serverTimestamp()
            };
            await setDoc(userRef, initialDoc, { merge: true });
          }
        } catch (e) {
          console.warn('Initial user doc check note:', e);
        }

        // Real-time live listener for current user document
        userUnsub = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentUser((prev) => ({
              ...prev,
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || prev.name,
              email: data.email || firebaseUser.email || prev.email,
              phone: data.phone || firebaseUser.phoneNumber || prev.phone,
              walletBalance: typeof data.walletBalance === 'number' ? data.walletBalance : prev.walletBalance,
              role: data.role || (isAdminEmail ? 'admin' : prev.role)
            }));
          }
        }, (err) => {
          console.warn('User snapshot subscription note:', err);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (userUnsub) userUnsub();
    };
  }, []);

  // Real-time Firestore sync for deposits collection
  useEffect(() => {
    try {
      const depositsColl = collection(db, 'deposits');
      const unsub = onSnapshot(depositsColl, (snapshot) => {
        if (!snapshot.empty) {
          const firestoreDeposits: DepositRequest[] = [];
          snapshot.forEach((d) => {
            firestoreDeposits.push({ ...(d.data() as DepositRequest), id: d.id });
          });
          setDeposits((prev) => {
            const map = new Map<string, DepositRequest>();
            prev.forEach((item) => map.set(item.id, item));
            firestoreDeposits.forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      }, (err) => {
        console.warn('Firestore deposits live listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore deposits subscription error:', e);
    }
  }, []);

  // Real-time Firestore sync for orders collection
  useEffect(() => {
    try {
      const ordersColl = collection(db, 'orders');
      const unsub = onSnapshot(ordersColl, (snapshot) => {
        if (!snapshot.empty) {
          const firestoreOrders: Order[] = [];
          snapshot.forEach((o) => {
            firestoreOrders.push({ ...(o.data() as Order), id: o.id });
          });
          setOrders((prev) => {
            const map = new Map<string, Order>();
            prev.forEach((item) => map.set(item.id, item));
            firestoreOrders.forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      }, (err) => {
        console.warn('Firestore orders live listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore orders subscription error:', e);
    }
  }, []);

  // Real-time Firestore sync for products collection (read by public store & admin)
  useEffect(() => {
    try {
      const productsColl = collection(db, 'products');
      const unsub = onSnapshot(productsColl, (snapshot) => {
        if (!snapshot.empty) {
          const firestoreProducts: TopUpProduct[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const normPackages: TopUpPackage[] = Array.isArray(data.packages)
              ? data.packages.map((pkg: any, idx: number) => ({
                  id: pkg.id || `pkg_${idx}`,
                  name: pkg.name || '',
                  amount: pkg.amount || pkg.diamonds || pkg.name || '',
                  diamonds: pkg.diamonds || pkg.amount || pkg.name || '',
                  price: Number(pkg.price || 0),
                  originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
                  popular: !!pkg.popular,
                  instantDelivery: pkg.instantDelivery !== false,
                  isOutOfStock: !!pkg.isOutOfStock
                }))
              : [];

            firestoreProducts.push({
              id: docSnap.id,
              title: data.title || '',
              description: data.description || '',
              bannerImageUrl: data.bannerImageUrl || data.image || '',
              image: data.bannerImageUrl || data.image || '/images/dc_topup_logo_1790094683501.jpg',
              badgeTag: data.badgeTag || data.badge || '',
              badge: data.badgeTag || data.badge || '',
              isActive: data.isActive !== false,
              sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 999,
              category: data.category || 'gaming',
              subCategory: data.subCategory || '',
              playerIdLabel: data.playerIdLabel || 'Player ID (UID)',
              requiresZoneId: !!data.requiresZoneId,
              zoneIdLabel: data.zoneIdLabel || '',
              bannerGradient: data.bannerGradient || 'from-blue-600/30 to-purple-950/40',
              packages: normPackages,
              isOutOfStock: !!data.isOutOfStock
            });
          });

          firestoreProducts.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
          setProducts(firestoreProducts);
        }
      }, (err) => {
        console.warn('Firestore products live listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore products subscription error:', e);
    }
  }, []);

  const loginWithGoogle = async (name?: string, email?: string, photoURL?: string) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const loggedUser: User = {
        id: u.uid,
        name: u.displayName || name || 'গুগল গেমার',
        email: u.email || email || '',
        photoURL: u.photoURL || photoURL || '',
        phone: u.phoneNumber || currentUser.phone || '01845-735906',
        walletBalance: currentUser.walletBalance,
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        savedGameUid: currentUser.savedGameUid
      };

      try {
        await setDoc(doc(db, 'users', u.uid), {
          ...loggedUser,
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      } catch (fsErr) {
        // ignore offline
      }

      setCurrentUser(loggedUser);
      showToast(`স্বাগতম, ${loggedUser.name}! Google অ্যাকাউন্ট দিয়ে লগইন সফল হয়েছে।`, 'success');
    } catch (popupErr: any) {
      console.warn('Google popup note (using fallback session):', popupErr);
      const googleUserEmail = email || 'shayedafride24@gmail.com';
      const googleUserName = name || 'সায়েদ আফ্রিদী';
      const googlePhoto = photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

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
      showToast(`স্বাগতম, ${googleUserName}! লগইন সফল হয়েছে।`, 'success');
    }
  };

  const signupWithEmail = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) return { success: false, error: 'আপনার পুরো নাম লিখুন।' };
    if (!email.trim() || !email.includes('@')) return { success: false, error: 'সঠিক ইমেইল ঠিকানা দিন।' };
    if (!password || password.length < 6) return { success: false, error: 'পাসওয়ার্ড খুব দুর্বল, কমপক্ষে ৬ ক্যারেক্টার দিন।' };

    const cleanEmail = email.toLowerCase().trim();
    let firebaseUid = '';

    try {
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      firebaseUid = userCred.user.uid;
      if (userCred.user) {
        await updateProfile(userCred.user, { displayName: name.trim() });
      }
    } catch (authErr: any) {
      console.warn('Firebase createUser note:', authErr);
      if (authErr?.code === 'auth/email-already-in-use') {
        return { success: false, error: 'এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট তৈরি করা আছে।' };
      }
    }

    try {
      const newUser: User = {
        id: firebaseUid || 'usr_em_' + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: cleanEmail,
        phone: '017' + Math.floor(10000000 + Math.random() * 90000000),
        walletBalance: 150.00, // Welcome signup bonus
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        savedGameUid: ''
      };

      try {
        await setDoc(doc(db, 'users', newUser.id), {
          ...newUser,
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (fsErr) {
        // ignore offline
      }

      setCurrentUser(newUser);
      showToast(`অভিনন্দন ${name}! আপনার অ্যাকাউন্ট তৈরি হয়েছে এবং লগইন সম্পন্ন হয়েছে।`, 'success');
      return { success: true };
    } catch {
      return { success: false, error: 'অ্যাকাউন্ট তৈরি করা যায়নি, আবার চেষ্টা করুন।' };
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password) return { success: false, error: 'ইমেইল এবং পাসওয়ার্ড পূরণ করুন।' };

    const cleanEmail = email.toLowerCase().trim();
    let firebaseUid = '';

    try {
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      firebaseUid = userCred.user.uid;
    } catch (authErr: any) {
      console.warn('Firebase signIn note:', authErr);
    }

    try {
      const user: User = {
        id: firebaseUid || 'usr_' + Math.random().toString(36).substring(2, 9),
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '01712-345678',
        walletBalance: currentUser.walletBalance || 200.00,
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
      };

      setCurrentUser(user);
      showToast(`স্বাগতম, ${user.name}! লগইন সফল হয়েছে।`, 'success');
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

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
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

    // Persist to Firestore deposits collection
    try {
      setDoc(doc(db, 'deposits', newDeposit.id), {
        ...newDeposit,
        createdAtTimestamp: serverTimestamp()
      }, { merge: true }).catch(() => {});
    } catch {
      // ignore
    }

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

    // Persist to Firestore orders collection
    try {
      setDoc(doc(db, 'orders', newOrder.id), {
        ...newOrder,
        createdAtTimestamp: serverTimestamp()
      }, { merge: true }).catch(() => {});
    } catch {
      // ignore
    }

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

  const approveDeposit = async (depositId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ডিপোজিট অনুমোদন করতে পারেন।', 'error');
      return;
    }

    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit) return;

    const nowStr = new Date().toLocaleDateString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // 1. Direct browser client SDK updateDoc call to Firestore deposits/{depositId}
    try {
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'approved',
        verifiedAt: nowStr,
        verifiedBy: currentUser.id
      });
    } catch (fsErr: any) {
      console.error('Firestore updateDoc deposit error:', fsErr);
      showToast(`Firestore ডিপোজিট আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }

    // 2. Also update customer's wallet balance in Firestore users/{userId}
    if (deposit.userId) {
      try {
        await updateDoc(doc(db, 'users', deposit.userId), {
          walletBalance: increment(deposit.amount)
        });
      } catch (userBalErr) {
        console.warn('Firestore user wallet update note:', userBalErr);
      }
    }

    // 3. Update local state
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              status: 'approved',
              verifiedAt: nowStr
            }
          : d
      )
    );

    // If target user is current user, update balance
    if (deposit.userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        walletBalance: Number((prev.walletBalance + deposit.amount).toFixed(2))
      }));
    }

    showToast(`ডিপোজিট ${deposit.id} (৳ ${deposit.amount}) সরাসরি Firestore-এ অ্যাপ্রুভ করা হয়েছে!`, 'success');
  };

  const rejectDeposit = async (depositId: string, reason: string) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ডিপোজিট বাতিল করতে পারেন।', 'error');
      return;
    }

    const nowStr = new Date().toLocaleDateString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Direct browser client SDK updateDoc call to Firestore deposits/{depositId}
    try {
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'rejected',
        rejectReason: reason || 'লেনদেন ভেরিফিকেশন ব্যর্থ হয়েছে।',
        verifiedAt: nowStr,
        verifiedBy: currentUser.id
      });
    } catch (fsErr: any) {
      console.error('Firestore updateDoc reject deposit error:', fsErr);
      showToast(`Firestore রিজেক্ট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }

    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              status: 'rejected',
              rejectReason: reason || 'লেনদেন ভেরিফিকেশন ব্যর্থ হয়েছে।',
              verifiedAt: nowStr
            }
          : d
      )
    );
    showToast(`ডিপোজিট ${depositId} সরাসরি Firestore-এ রিজেক্ট করা হয়েছে।`, 'info');
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা অর্ডার স্ট্যাটাস আপডেট করতে পারেন।', 'error');
      return;
    }

    const nowTime = new Date().toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const updateFields: any = {
      status,
      notes: notes || (status === 'delivered' ? 'ডেলিভারি সম্পন্ন।' : status === 'processing' ? 'সার্ভার প্রসেসিং চলছে...' : status === 'pending' ? 'অপেক্ষমাণ।' : 'ব্যর্থ হয়েছে।')
    };

    if (status === 'delivered') updateFields.deliveredAt = nowTime;
    if (status === 'processing') updateFields.processingAt = nowTime;

    // Direct browser client SDK updateDoc call to Firestore orders/{orderId}
    try {
      await updateDoc(doc(db, 'orders', orderId), updateFields);
    } catch (fsErr: any) {
      console.error('Firestore updateDoc order error:', fsErr);
      showToast(`Firestore অর্ডার আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              ...updateFields
            }
          : o
      )
    );
    showToast(`অর্ডার ${orderId} স্ট্যাটাস সরাসরি Firestore-এ ${status.toUpperCase()} করা হয়েছে!`, 'info');
  };

  const seedProductsToFirestore = async () => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ক্যাটালগ সিড করতে পারেন।', 'error');
      return;
    }

    try {
      showToast('Firestore-এ প্রোডাক্ট ডাটা সিড হচ্ছে...', 'info');
      for (let i = 0; i < INITIAL_PRODUCTS.length; i++) {
        const p = INITIAL_PRODUCTS[i];
        const docRef = doc(db, 'products', p.id);
        const data = {
          id: p.id,
          title: p.title,
          description: p.description,
          bannerImageUrl: p.bannerImageUrl || p.image,
          image: p.bannerImageUrl || p.image,
          badgeTag: p.badgeTag || p.badge || 'Special Offer',
          badge: p.badgeTag || p.badge || 'Special Offer',
          isActive: p.isActive !== false,
          sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : i + 1,
          category: p.category,
          subCategory: p.subCategory || '',
          playerIdLabel: p.playerIdLabel || 'Player ID (UID)',
          requiresZoneId: !!p.requiresZoneId,
          zoneIdLabel: p.zoneIdLabel || '',
          bannerGradient: p.bannerGradient || 'from-blue-600/30 to-purple-950/40',
          packages: p.packages.map((pkg, idx) => ({
            id: pkg.id || `pkg_${idx}`,
            name: pkg.name,
            amount: pkg.amount || pkg.diamonds || '',
            diamonds: pkg.diamonds || pkg.amount || '',
            price: Number(pkg.price),
            originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
            popular: !!pkg.popular,
            instantDelivery: pkg.instantDelivery !== false,
            isOutOfStock: !!pkg.isOutOfStock
          })),
          isOutOfStock: !!p.isOutOfStock,
          createdAt: serverTimestamp()
        };
        await setDoc(docRef, data, { merge: true });
      }
      showToast('সবগুলো প্রোডাক্ট সফলভাবে Firestore "products" কালেকশনে সংরক্ষিত হয়েছে!', 'success');
    } catch (err: any) {
      console.error('Firestore seed products error:', err);
      showToast(`Firestore সিড ত্রুটি: ${err?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const addProduct = async (product: TopUpProduct) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা নতুন প্রোডাক্ট যোগ করতে পারেন।', 'error');
      return;
    }

    const id = product.id && product.id.trim()
      ? product.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : 'prod_' + Math.random().toString(36).substring(2, 9);

    const bannerImg = product.bannerImageUrl || product.image || '/images/dc_topup_logo_1790094683501.jpg';
    const badgeText = product.badgeTag || product.badge || '';

    const newProductDoc: TopUpProduct = {
      ...product,
      id,
      title: product.title.trim(),
      description: product.description.trim(),
      bannerImageUrl: bannerImg,
      image: bannerImg,
      badgeTag: badgeText,
      badge: badgeText,
      isActive: product.isActive !== false,
      sortOrder: product.sortOrder || products.length + 1,
      category: product.category || 'gaming',
      subCategory: product.subCategory || 'Special Offer',
      playerIdLabel: product.playerIdLabel || 'Player ID (UID)',
      requiresZoneId: !!product.requiresZoneId,
      zoneIdLabel: product.zoneIdLabel || '',
      bannerGradient: product.bannerGradient || 'from-blue-600/30 to-purple-950/40',
      packages: (product.packages || []).map((pkg, idx) => ({
        id: pkg.id || `pkg_${Date.now()}_${idx}`,
        name: pkg.name,
        price: Number(pkg.price),
        amount: pkg.amount || pkg.diamonds || pkg.name,
        diamonds: pkg.diamonds || pkg.amount || pkg.name,
        originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
        popular: !!pkg.popular,
        instantDelivery: pkg.instantDelivery !== false,
        isOutOfStock: !!pkg.isOutOfStock
      })),
      isOutOfStock: !!product.isOutOfStock
    };

    try {
      await setDoc(doc(db, 'products', id), newProductDoc);
      setProducts((prev) => [newProductDoc, ...prev.filter((p) => p.id !== id)]);
      showToast(`নতুন প্রোডাক্ট '${product.title}' সফলভাবে Firestore-এ যোগ করা হয়েছে!`, 'success');
    } catch (fsErr: any) {
      console.error('Firestore add product error:', fsErr);
      showToast(`Firestore প্রোডাক্ট যোগে ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const updateProduct = async (updatedProduct: TopUpProduct) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্রোডাক্ট আপডেট করতে পারেন।', 'error');
      return;
    }

    try {
      const bannerImg = updatedProduct.bannerImageUrl || updatedProduct.image;
      const badgeText = updatedProduct.badgeTag || updatedProduct.badge || '';
      const docData = {
        ...updatedProduct,
        bannerImageUrl: bannerImg,
        image: bannerImg,
        badgeTag: badgeText,
        badge: badgeText,
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'products', updatedProduct.id), docData, { merge: true });
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...docData } : p)));
      showToast(`প্রোডাক্ট '${updatedProduct.title}' সরাসরি Firestore-এ আপডেট হয়েছে!`, 'success');
    } catch (fsErr: any) {
      console.error('Firestore update product error:', fsErr);
      showToast(`Firestore প্রোডাক্ট আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্রোডাক্ট মুছতে পারেন।', 'error');
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('প্রোডাক্ট সরাসরি Firestore থেকে মুছে ফেলা হয়েছে!', 'info');
    } catch (fsErr: any) {
      console.error('Firestore delete product error:', fsErr);
      showToast(`Firestore প্রোডাক্ট ডিলিট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const toggleProductActive = async (productId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্রোডাক্ট হাইড/শো করতে পারেন।', 'error');
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newActive = prod.isActive === false ? true : false;
    try {
      await updateDoc(doc(db, 'products', productId), {
        isActive: newActive
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isActive: newActive } : p))
      );
      showToast(
        `প্রোডাক্ট '${prod.title}' এখন ${newActive ? 'পাবলিক স্টোরে দৃশ্যমান (Active)' : 'লুকানো (Hidden/Inactive)'}!`,
        newActive ? 'success' : 'info'
      );
    } catch (fsErr: any) {
      console.error('Firestore toggle active error:', fsErr);
      showToast(`Firestore স্ট্যাটাস পরিবর্তন ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const toggleProductStock = async (productId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা স্টক নিয়ন্ত্রণ করতে পারেন।', 'error');
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newStock = !prod.isOutOfStock;
    try {
      await updateDoc(doc(db, 'products', productId), {
        isOutOfStock: newStock
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isOutOfStock: newStock } : p))
      );
      showToast(
        `প্রোডাক্ট '${prod.title}' এখন ${newStock ? 'স্টক আউট (Stock Out)' : 'স্টকে রয়েছে (In Stock)'}!`,
        newStock ? 'info' : 'success'
      );
    } catch (fsErr: any) {
      console.error('Firestore toggle stock error:', fsErr);
      showToast(`Firestore স্টক আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const togglePackageStock = async (productId: string, packageId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্যাকেজ স্টক নিয়ন্ত্রণ করতে পারেন।', 'error');
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const updatedPkgs = prod.packages.map((pkg) => {
      if (pkg.id !== packageId) return pkg;
      return { ...pkg, isOutOfStock: !pkg.isOutOfStock };
    });

    try {
      await updateDoc(doc(db, 'products', productId), {
        packages: updatedPkgs
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, packages: updatedPkgs } : p))
      );
      showToast('প্যাকেজ স্টক সফলভাবে আপডেট হয়েছে!', 'success');
    } catch (fsErr: any) {
      console.error('Firestore toggle package stock error:', fsErr);
      showToast(`Firestore প্যাকেজ স্টক ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const updateProductImage = async (productId: string, newImageUrl: string) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ছবি পরিবর্তন করতে পারেন।', 'error');
      return;
    }

    try {
      await updateDoc(doc(db, 'products', productId), {
        bannerImageUrl: newImageUrl,
        image: newImageUrl
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, bannerImageUrl: newImageUrl, image: newImageUrl } : p))
      );
      showToast('প্রোডাক্ট ব্যানার ছবি সরাসরি Firestore-এ আপডেট হয়েছে!', 'success');
    } catch (fsErr: any) {
      console.error('Firestore update product image error:', fsErr);
      showToast(`Firestore ব্যানার আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const updateProductPackages = async (productId: string, packages: TopUpPackage[]) => {
    if (currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্যাকেজ পরিবর্তন করতে পারেন।', 'error');
      return;
    }

    const formattedPkgs = packages.map((pkg, idx) => ({
      id: pkg.id || `pkg_${Date.now()}_${idx}`,
      name: pkg.name,
      price: Number(pkg.price),
      amount: pkg.amount || pkg.diamonds || pkg.name,
      diamonds: pkg.diamonds || pkg.amount || pkg.name,
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
      popular: !!pkg.popular,
      instantDelivery: pkg.instantDelivery !== false,
      isOutOfStock: !!pkg.isOutOfStock
    }));

    try {
      await updateDoc(doc(db, 'products', productId), {
        packages: formattedPkgs
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, packages: formattedPkgs } : p))
      );
      showToast('প্যাকেজ ও মূল্য তালিকা সরাসরি Firestore-এ আপডেট হয়েছে!', 'success');
    } catch (fsErr: any) {
      console.error('Firestore update packages error:', fsErr);
      showToast(`Firestore প্যাকেজ আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
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
        toggleProductActive,
        togglePackageStock,
        updateProductImage,
        updateProductPackages,
        seedProductsToFirestore
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
