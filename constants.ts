
import { Product, Order, User } from './types';

export const APP_NAME = "Orderly";
export const STORAGE_KEY_USER = "orderly_user_v1";
export const STORAGE_KEY_PRODUCTS = "orderly_products_v1";
export const STORAGE_KEY_ORDERS = "orderly_orders_v1";
export const STORAGE_KEY_THEME = "orderly_theme";

export const CURRENCIES = [
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Premium Coffee Beans', sku: 'CF-001', price: 85, stock: 12, lowStockThreshold: 5, status: 'active', lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Organic Green Tea', sku: 'GT-022', price: 45, stock: 3, lowStockThreshold: 10, status: 'active', lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Artisan Honey Jar', sku: 'HJ-015', price: 120, stock: 0, lowStockThreshold: 2, status: 'active', lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Dark Chocolate 70%', sku: 'DC-099', price: 35, stock: 45, lowStockThreshold: 5, status: 'active', lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Vanilla Extract', sku: 'VE-102', price: 65, stock: 20, lowStockThreshold: 8, status: 'active', lastUpdated: new Date().toISOString() },
  { id: '6', name: 'Almond Milk (1L)', sku: 'AM-500', price: 15, stock: 100, lowStockThreshold: 20, status: 'active', lastUpdated: new Date().toISOString() },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'Sarah Ahmed',
    whatsappNumber: '+971501234567',
    items: [{ productId: '1', productName: 'Premium Coffee Beans', quantity: 2, price: 85 }],
    total: 170,
    status: 'pending',
    createdAt: new Date().toISOString(), // Today
  },
  {
    id: 'ORD-1002',
    customerName: 'John Doe',
    whatsappNumber: '+971509988776',
    items: [{ productId: '4', productName: 'Dark Chocolate 70%', quantity: 10, price: 35 }],
    total: 350,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ORD-1003',
    customerName: 'Michael Chen',
    whatsappNumber: '+971556677889',
    items: [{ productId: '2', productName: 'Organic Green Tea', quantity: 5, price: 45 }],
    total: 225,
    status: 'pending',
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
  },
  {
    id: 'ORD-1004',
    customerName: 'Emma Wilson',
    whatsappNumber: '+447711223344',
    items: [{ productId: '1', productName: 'Premium Coffee Beans', quantity: 10, price: 85 }],
    total: 850,
    status: 'completed',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // Yesterday
  },
  {
    id: 'ORD-1005',
    customerName: 'Liam O Connor',
    whatsappNumber: '+35312345678',
    items: [{ productId: '3', productName: 'Artisan Honey Jar', quantity: 2, price: 120 }],
    total: 240,
    status: 'cancelled',
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_ACTIVITY = [
  { date: 'Today', items: [
    { type: 'stock', text: 'Sarah Ahmed updated "Premium Coffee Beans" stock to 12', time: '10:45 AM' },
    { type: 'order', text: 'New order #ORD-1003 received via WhatsApp', time: '09:12 AM' },
    { type: 'staff', text: 'Mike Johnson joined the team', time: '08:00 AM' },
  ]},
  { date: 'Yesterday', items: [
    { type: 'billing', text: 'Subscription plan upgraded to Pro', time: '04:30 PM' },
    { type: 'order', text: 'Order #ORD-1002 marked as completed', time: '11:20 AM' },
  ]}
];

export const PLAN_LIMITS = {
  free: {
    maxStaff: 0,
    analytics: false,
    invoicing: false,
  },
  business: {
    maxStaff: 3,
    analytics: true,
    invoicing: false,
  },
  pro: {
    maxStaff: Infinity,
    analytics: true,
    invoicing: true,
  }
};
