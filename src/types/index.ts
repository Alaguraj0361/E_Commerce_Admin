export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  price: number;
  stock: number;
  images?: string[];
  attributes?: {
    size?: string;
    color?: string;
    colorHex?: string;
    material?: string;
    [key: string]: any;
  };
}

export interface ProductImage {
  url: string;
  alt?: string;
  isMain?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: Brand | string;
  category: Category | string;
  images: ProductImage[];
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  variants: ProductVariant[];
  attributes?: Record<string, string[]>;
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  hasBespokeTailoring?: boolean;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  attributes?: Record<string, any>;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  trackingNumber?: string;
  notes?: string;
  timeline: OrderTimeline[];
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  startDate?: string;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Review {
  _id: string;
  product: Product;
  user: User;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
}

// =========================================================================
// STITCHING & TAILORING ATELIER TYPES
// =========================================================================
export interface MeasurementFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
}

export interface StitchingCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  estimatedTurnaroundDays: number;
  iconName?: string;
  fields: MeasurementFieldDef[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StitchingMeasurement {
  _id: string;
  measurementCode: string; // e.g. "MEAS-1001"
  date: string; // YYYY-MM-DD
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCity?: string;
  categorySlug: string;
  categoryName: string;
  measurements: Record<string, string>; // e.g. { bust: "36", length: "14.5" }
  specialInstructions?: string;
  fitPreference?: 'Comfort Fit' | 'Snug / Tight Fit' | 'Standard Fit';
  unit: 'inches' | 'cm';
  createdAt?: string;
  updatedAt?: string;
}

export interface StitchingDispatchOrder {
  _id: string;
  stitchingOrderNumber: string; // e.g. "STITCH-1001"
  date: string; // Booking / Order date
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  categorySlug: string;
  categoryName: string;
  measurementId?: string; // Reference to StitchingMeasurement._id
  measurementCode?: string; // e.g. "MEAS-1001"
  measurementSummary?: string; // e.g. "Bust: 36\", Length: 14.5\""
  estimatedDispatchDate: string; // Target delivery/dispatch date
  actualDispatchDate?: string;
  additionalInformation?: string; // Fabric details, styling, neck pattern, etc.
  liningType?: string; // e.g. "Pure Mulmul Cotton", "Crepe", "No Lining"
  fabricProvidedBy?: 'Customer Provided' | 'Store Fabric' | 'Purchased with Saree';
  assignedTailor?: string; // Master tailor name
  priority: 'Normal' | 'Express (48h)' | 'Urgent Wedding VIP';
  status:
    | 'Order Confirmed'
    | 'Fabric Received'
    | 'Pattern Cutting'
    | 'Embroidery / Aari'
    | 'Stitching In Progress'
    | 'Trial / Alteration'
    | 'Ironing & Packed'
    | 'Ready for Dispatch'
    | 'Dispatched'
    | 'Delivered';
  stitchingCharge: number;
  advancePaid: number;
  balanceDue: number;
  courierPartner?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
