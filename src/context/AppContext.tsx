import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DepositRequest, Order, TopUpProduct, PaymentMethodType } from '../types';
import { INITIAL_USER, ADMIN_USER, INITIAL_PRODUCTS, INITIAL_DEPOSITS, INITIAL_ORDERS } from '../data/initialData';

export type ActiveTab = 'home' | 'deposit' | 'orders' | 'admin';

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
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  
  // Auth
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
  updateOrderStatus: (orderId: string, status: 'delivered' | 'failed', notes?: string) => void;
  addProduct: (product: TopUpProduct) => void;
  updateProduct: (product: TopUpProduct) => void;
  deleteProduct: (productId: string) => void;
  resetToSampleData: () => void;
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
    const saved = localStorage.getItem('dc_products');
    if (saved) {
      try {
        const parsed: TopUpProduct[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
        // Also ensure categories for existing items have correct primary category
        const updated = parsed.map((p) => {
          let item = { ...p };
          if (['battle_royale', 'moba', 'fps'].includes(item.category as string)) {
            item = { ...item, category: 'games' as const, subCategory: item.category };
          }
          if (item.id === 'freefire') {
            item.image = '/dc_logo.jpg';
          }
          return item;
        });
        return missing.length > 0 ? [...updated, ...missing] : updated;
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [deposits, setDeposits] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('dc_deposits');
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dc_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loginWithPhone = (phone: string, name?: string) => {
    const user: User = {
      id: 'usr_' + phone.replace(/[^0-9]/g, '').slice(-6),
      name: name || 'গেমার ' + phone.slice(-4),
      phone,
      walletBalance: 250.00,
      role: 'user',
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(user);
    showToast(`স্বাগতম, ${user.name}! লগইন সফল হয়েছে।`, 'success');
  };

  const logout = () => {
    setCurrentUser(INITIAL_USER);
    setIsAdminMode(false);
    showToast('লগআউট সফল হয়েছে।', 'info');
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

    const pkg = product.packages.find((p) => p.id === packageId);
    if (!pkg) return { success: false, error: 'প্যাকেজ খুঁজে পাওয়া যায়নি।' };

    if (currentUser.walletBalance < pkg.price) {
      const shortage = pkg.price - currentUser.walletBalance;
      return {
        success: false,
        error: `অপর্যাপ্ত ওয়ালেট ব্যালেন্স! আপনার ঘাটতি আছে ৳ ${shortage.toFixed(2)}। অনুগ্রহ করে টাকা যোগ করুন।`
      };
    }

    // Deduct balance
    const updatedBalance = currentUser.walletBalance - pkg.price;
    setCurrentUser((prev) => ({ ...prev, walletBalance: updatedBalance }));

    // Create Order
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
      status: 'processing',
      createdAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      notes: 'অর্ডার সার্ভারে ভেরিফাই হচ্ছে...'
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`অর্ডার সফল! ${pkg.name} প্রসেসিং হচ্ছে। ৳ ${pkg.price} ওয়ালেট থেকে কাটা হয়েছে।`, 'success');

    // Simulate instant delivery for packages marked instant
    if (pkg.instantDelivery) {
      setTimeout(() => {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === newOrder.id
              ? {
                  ...ord,
                  status: 'delivered',
                  deliveredAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
                  notes: 'ইনস্ট্যান্ট সার্ভার এপিআই এর মাধ্যমে গেম একাউন্টে সফলভাবে ডেলিভার হয়েছে!'
                }
              : ord
          )
        );
      }, 5000);
    }

    return { success: true, order: newOrder };
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

    // If belongs to current logged in user, credit wallet immediately
    if (deposit.userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        walletBalance: prev.walletBalance + deposit.amount
      }));
    }

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

  const updateOrderStatus = (orderId: string, status: 'delivered' | 'failed', notes?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              notes: notes || (status === 'delivered' ? 'ডেলিভারি সম্পন্ন।' : 'ব্যর্থ হয়েছে।'),
              deliveredAt: status === 'delivered' ? new Date().toLocaleTimeString('bn-BD') : undefined
            }
          : o
      )
    );
    showToast(`অর্ডার ${orderId} স্ট্যাটাস আপডেট হয়েছে: ${status === 'delivered' ? 'ডেলিভার্ড' : 'ফেইল্ড'}`, 'success');
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

  const resetToSampleData = () => {
    localStorage.removeItem('dc_products');
    localStorage.removeItem('dc_deposits');
    localStorage.removeItem('dc_orders');
    localStorage.removeItem('dc_user');
    setProducts(INITIAL_PRODUCTS);
    setDeposits(INITIAL_DEPOSITS);
    setOrders(INITIAL_ORDERS);
    setCurrentUser(INITIAL_USER);
    showToast('সব ডেমো ডেটা রিসেট হয়েছে!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser: isAdminMode ? ADMIN_USER : currentUser,
        isAdminMode,
        setIsAdminMode,
        activeTab,
        setActiveTab,
        products,
        deposits,
        orders,
        toasts,
        showToast,
        loginWithPhone,
        logout,
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
        resetToSampleData
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
