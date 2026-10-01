export type PaymentMethodType = 'bkash' | 'nagad';

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
  diamonds?: string; // alias for amount
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
  description: string;
  bannerImageUrl?: string;
  image: string; // backward compatibility fallback
  badgeTag?: string; // e.g. "Special Offer"
  badge?: string; // alias
  isActive: boolean;
  sortOrder?: number;
  category: ProductCategory;
  subCategory?: string; // e.g. "Battle Royale", "MOBA", "FPS", "Steam", "Gift Card"
  playerIdLabel?: string; // e.g., "Player ID (UID)" or "Riot ID"
  requiresZoneId?: boolean;
  zoneIdLabel?: string;
  bannerGradient?: string;
  packages: TopUpPackage[];
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
  photoURL?: string;
  walletBalance: number;
  role: 'user' | 'admin' | 'customer';
  joinedAt: string;
  avatarUrl?: string;
  savedGameUid?: string;
  status?: string;
}

export interface PaymentAccountInfo {
  method: PaymentMethodType;
  name: string;
  number: string;
  numbers?: string[];
  type: 'Personal' | 'Agent';
  qrPlaceholder?: string;
  instructions: string[];
  color: string;
}
