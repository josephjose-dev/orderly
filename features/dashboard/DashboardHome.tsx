import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { useInventory } from '../../hooks/useInventory';
import { formatCurrency, getStatusColor, cn, isSameLocalDay } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

type Props = {
  onNavigate?: (path: string) => void;
};

export const DashboardHome: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { products, orders, stopOrderMode } = useInventory();

  const currency = organization.currency;

  const lowStockCount = useMemo(() => {
    return products.filter(product => {
      if (product.optionGroup?.options?.length) {
        return product.optionGroup.options.some(
          opt => opt.stock <= (opt.lowStockThreshold ?? product.lowStockThreshold)
        );
      }
      return product.stock <= product.lowStockThreshold;
    }).length;
  }, [products]);

  const stats = useMemo(() => {
    const today = new Date();

    const revenueToday = orders
      .filter(o => isSameLocalDay(o.createdAt, today) && o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);

    const activeOrdersTodayCount = orders
      .filter(o => isSameLocalDay(o.createdAt, today) && o.status !== 'cancelled')
      .length;

    return [
      { label: 'Revenue Today', value: formatCurrency(revenueToday, currency), icon: TrendingUp, primary: true },
      {
        label: 'Orders Today',
        value: activeOrdersTodayCount.toString(),
        icon: ShoppingBag,
        orderRedirect: true
      },
      { label: 'Active Inventory', value: products.length.toString(), icon: Package },
      {
        label: lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'Stock Alerts',
        value: lowStockCount.toString(),
        icon: AlertCircle,
        lowStock: true,
        isUrgent: lowStockCount > 0
      },
    ];
  }, [orders, products, currency, lowStockCount]);

  const recentOrders = useMemo(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black">Good Morning, {user?.name.split(' ')[0]}</h1>
        {lowStockCount > 0 ? (
          <p className="text-red-500 font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            ⚠️ Attention required: low stock items detected
          </p>
        ) : (
          <p className="text-gray-500">Everything seems to be in order at <b>{organization.name}</b>.</p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => {
              if (stat.lowStock && onNavigate) {
                stopOrderMode(); // ✅ Ensure cart is hidden when viewing low stock
                localStorage.setItem('filter_low_stock', 'true');
                onNavigate('products');
              } else if (stat.orderRedirect && onNavigate) {
                localStorage.setItem('order_filter_day', 'today');
                onNavigate('orders');
              }
            }}
            className={cn(
              'p-6 rounded-3xl border cursor-pointer transition-all',
              stat.primary ? 'bg-primary text-white shadow-lg shadow-primary/20' :
                stat.isUrgent ? 'bg-red-50 border-red-200 text-red-600 shadow-lg shadow-red-100' : 'bg-white hover:bg-gray-50',
            )}
          >
            <stat.icon className={cn("h-6 w-6 mb-4", stat.isUrgent ? "text-red-500" : "")} />
            <p className={cn("text-xs uppercase font-bold", stat.isUrgent ? "text-red-600/70" : "text-gray-400")}>{stat.label}</p>
            <p className="text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50">
          <h3 className="font-black text-sm uppercase text-gray-400 tracking-wider">Recent Active Orders</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 italic text-sm">
            No active orders to show.
          </div>
        ) : (
          recentOrders.map(order => (
            <div key={order.id} className="p-6 flex justify-between items-center border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="font-black text-sm text-primary">{order.id}</p>
                <p className="text-xs text-gray-500 font-bold mb-1">{order.customerName}</p>
                <div className="flex flex-wrap gap-x-2">
                  <p className="text-[10px] text-gray-400 italic">
                    {order.items.map(item => {
                      const productExists = products.find(p => p.id === item.productId);
                      return `${item.quantity}× ${productExists ? item.productName : 'Deleted product'}${item.selectedOptionLabel ? ` (${item.selectedOptionLabel})` : ''}`;
                    }).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-black">{formatCurrency(order.total, currency)}</span>
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase',
                  order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                )}>
                  {order.status === 'completed' ? (
                    <><CheckCircle className="h-3 w-3" /> COMPLETED</>
                  ) : (
                    <>PENDING</>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
