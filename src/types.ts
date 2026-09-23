export type PaymentMethodType = 'bkash' | 'nagad' | 'rocket';

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'failed';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  method: PaymentMethodType;
  amount: number;
  senderPhone: string;
  trxId: string;
  status: DepositStatus;
  rejectReason?: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface TopUpPackage {
  id: string;
  name: string; // e.g., "115 Diamonds" or "60 UC"
  amount: string; // "115 💎"
  price: number; // in BDT ৳
  originalPrice?: number;
  popular?: boolean;
  instantDelivery?: boolean;
  isOutOfStock?: boolean;
}

export type ProductCategory = 'gaming' | 'facebook' | 'tiktok' | 'games';

export interface TopUpProduct {
  id: string;
  title: string;
  category: ProductCategory;
  subCategory?: string; // e.g. "Battle Royale", "MOBA", "FPS", "Steam", "Gift Card"
  badge?: string;
  description: string;
  playerIdLabel: string; // e.g., "Player ID (UID)" or "Riot ID"
  requiresZoneId?: boolean;
  zoneIdLabel?: string;
  image: string;
  bannerGradient: string;
  packages: TopUpPackage[];
  isActive: boolean;
  isOutOfStock?: boolean;
}

export interface AppNotice {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'urgent' | 'offer';
  isActive: boolean;
  updatedAt: string;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  badge?: string;
  actionTab?: 'deposit' | 'orders' | 'home';
  actionText?: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productTitle: string;
  packageId: string;
  packageName: string;
  price: number;
  playerId: string;
  zoneId?: string;
  status: OrderStatus;
  createdAt: string;
  processingAt?: string;
  deliveredAt?: string;
  serverRef?: string;
  estimatedDeliverySeconds?: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  walletBalance: number;
  role: 'user' | 'admin';
  joinedAt: string;
  avatarUrl?: string;
  savedGameUid?: string;
}

export interface PaymentAccountInfo {
  method: PaymentMethodType;
  name: string;
  number: string;
  type: 'Personal' | 'Agent';
  qrPlaceholder?: string;
  instructions: string[];
  color: string;
}
