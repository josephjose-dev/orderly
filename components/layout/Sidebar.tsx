
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  Users,
  CreditCard,
  Settings,
  BookOpen,
  Lock,
  ArrowUpCircle
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { user, isEarlyAccess } = useAuth(); // ✅ Added isEarlyAccess

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'all', plan: 'free' },
    { id: 'products', label: 'Products', icon: Package, role: 'all', plan: 'free' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, role: 'all', plan: 'free' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, role: 'all', plan: 'business' },
    { id: 'invoices', label: 'Invoices', icon: FileText, role: 'admin', plan: 'pro' },
    { id: 'staff', label: 'Staff', icon: Users, role: 'admin', plan: 'business' },
    { id: 'billing', label: 'Billing', icon: CreditCard, role: 'admin', plan: 'free' },
    { id: 'settings', label: 'Settings', icon: Settings, role: 'all', plan: 'free' },
    { id: 'guide', label: 'Beginner Guide', icon: BookOpen, role: 'all', plan: 'free' },
  ];

  const isLocked = (item: any) => {
    if (!user) return false;
    const plan = user.subscriptionPlan.toLowerCase();
    if (item.plan === 'business' && plan === 'free') return true;
    if (item.plan === 'pro' && (plan === 'free' || plan === 'business')) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-primary text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Orderly</h1>
        <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-semibold">Inventory Manager</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          if (item.role === 'admin' && user?.role !== 'admin') return null;
          // Staff hiding via isEarlyAccess removed implementation


          const locked = isLocked(item);
          const active = currentPath === item.id;

          return (
            <button
              key={item.id}
              onClick={() => !locked && onNavigate(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                active
                  ? 'bg-secondary text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white',
                locked && 'opacity-60 cursor-not-allowed'
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {locked && (
                <div className="flex items-center">
                  <Lock className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1 rounded uppercase font-black">
                    {item.plan === 'pro' ? 'PRO' : 'BIZ'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {user?.subscriptionPlan !== 'pro' && !isEarlyAccess && ( // ✅ Consider Beta context for upgrade box
        <div className="m-4 p-4 bg-white/10 rounded-xl border border-white/10">
          <div className="flex items-center space-x-2 text-yellow-400 mb-2">
            <ArrowUpCircle className="h-5 w-5" />
            <span className="font-bold text-sm">Upgrade Plan</span>
          </div>
          <p className="text-xs text-gray-300 mb-3">Unlock analytics, staff, and invoices.</p>
          <button
            onClick={() => onNavigate('billing')}
            className="w-full bg-accent hover:bg-opacity-90 text-white text-xs font-bold py-2 rounded-lg transition-all"
          >
            View Pricing
          </button>
        </div>
      )}

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs uppercase">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-400 capitalize font-medium">{user?.role} • {user?.subscriptionPlan} plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
