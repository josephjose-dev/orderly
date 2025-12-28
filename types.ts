
export type UserRole = 'admin' | 'staff';
export type SubscriptionPlan = 'free' | 'business' | 'pro';
export type BusinessRegion = 'UAE' | 'IN' | 'GLOBAL';
export type BusinessType = 'Cafe' | 'Retail' | 'Electronics' | 'Other';

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  country: string;
  currency: string;
  plan: SubscriptionPlan; // Plan is now tracked on Business
  ownerId: string; // Link to Admin User
  createdAt: string;
  config?: OrganizationConfig; // Moved config to Business
}

export interface OrganizationConfig {
  country: string;
  timezone: string;
  language: string;
  functionalCurrency: string;
  displayCurrency: string;
  multiCurrencyEnabled: boolean;
  taxSystem: 'VAT' | 'GST' | 'Sales Tax' | 'None';
  taxNumber?: string;
  taxRate: number;
  pricesIncludeTax: boolean;
  inventoryTracking: boolean;
  lowStockThreshold: number;
  orderSources: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  businessId: string; // Linked Business

  // Legacy fields (kept for compatibility during migration, should be migrated to Business)
  organizationName?: string;
  organizationId?: string;
  subscriptionPlan?: SubscriptionPlan; // Legacy, prefer Business.plan
  region?: BusinessRegion;
  currency?: string;
  config?: OrganizationConfig;
  hasCompletedOnboarding: boolean;
}

// Added ProductOption and ProductOptionGroup for flexible product variety
export interface ProductOption {
  id: string; // REQUIRED for precise tracking
  label: string; // e.g. "M", "500ml"
  stock: number;
  priceAdjustment?: number;
  lowStockThreshold?: number; // Optional per-option threshold
}

export interface ProductOptionGroup {
  label: string; // e.g. "Size", "Volume"
  affectsStock: boolean; // Always true in current Beta
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'archived';
  lastUpdated: string;
  optionGroup?: ProductOptionGroup; // Added support for one option group
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  selectedOptionId?: string; // REQUIRED if product has options
  selectedOptionLabel?: string; // Track which option was chosen for display
}

export interface Order {
  id: string;
  customerName: string;
  whatsappNumber: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO Date string
  note?: string;


  // New Tax & Totals Fields
  subtotal: number;
  taxSnapshots?: OrderTaxSnapshot[]; // Breakdown of applied taxes
  taxAmount: number; // Total tax amount
  discount: number;
}

export interface TaxLine {
  id: string;
  name: string;
  rate: number;
  mode: 'fixed' | 'editable';
  enabled: boolean;
}

export interface OrderTaxSnapshot {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

export interface TaxConfig {
  taxes: TaxLine[];
  // Metadata
  updatedAt: string;
}

export interface InvoiceSettings {
  companyName: string;
  address: string;
  phone: string;
  email?: string;
  taxId?: string;
  logoUrl?: string;
  signatureUrl?: string;
  logoPosition: 'left' | 'center' | 'right';
  invoiceTitle: string;
  footerNote: string;
  termsText?: string;
  showOrderIds: boolean;
  showCustomerName: boolean;
  showNotes: boolean;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  primaryColor: string; // Hex code
  taxRate: number; // Percentage
  dueDateDays: number; // For Due Date calculation
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  format: 'excel' | 'pdf';
  orderIds: string[];
  totalAmount: number;
  createdAt: string;
  createdBy: 'admin' | 'staff';
  status: 'paid' | 'pending' | 'cancelled' | 'generated';
  periodLabel: string;
  customerName: string;
  snapshot: Order[];
}

export interface WhatsAppSettings {
  enabled: boolean;

  // Triggers
  sendOnCreate: boolean;
  sendOnComplete: boolean;

  // Templates
  templateCreate: string;
  templateComplete: string;
  templateInvoice: string;

  // Usage Tracking
  dailyCount: number;
  lastResetDate: string; // YYYY-MM-DD
}
