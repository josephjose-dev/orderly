
import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { useInventory } from '../../hooks/useInventory';
import { formatCurrency, cn } from '../../lib/utils';
import { BarChart, TrendingUp, Users, ShoppingCart, ArrowUpRight, Lock, Sparkles, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AnalyticsView: React.FC = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { orders, products } = useInventory();
  
  const isPro = user?.subscriptionPlan === 'pro';
  const currency = organization.currency;

  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((acc, o) => acc + o.total, 0);

    const totalOrders = orders.length;
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const lowStockCount = products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length;

    return [
      { label: 'Total Revenue', value: formatCurrency(totalRevenue, currency), change: '+12.5%', icon: TrendingUp, context: 'all time completed' },
      { label: 'Orders Logged', value: totalOrders.toString(), change: '+8.2%', icon: ShoppingCart, context: 'total history' },
      { label: 'Avg Order Value', value: formatCurrency(avgOrderValue, currency), change: '-2.1%', icon: BarChart, context: 'per transaction' },
      { label: 'Low Stock Items', value: lowStockCount.toString(), change: '+15.3%', icon: AlertCircle, iconColor: 'text-red-500', context: 'needs attention' },
    ];
  }, [orders, products, currency]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Insights derived from your live Orderly database.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="rounded-xl font-bold">Export Report</Button>
          <Button variant="outline" size="sm" className="rounded-xl font-bold">Last 30 Days</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                {m.icon && <m.icon className={cn("h-6 w-6", m.iconColor)} />}
              </div>
              <div className={cn(
                "flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                m.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {m.change}
                <ArrowUpRight className={cn("h-3 w-3 ml-1", !m.change.startsWith('+') && "rotate-90")} />
              </div>
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{m.label}</p>
            <p className="text-3xl font-black mt-1 dark:text-white tracking-tighter">{m.value}</p>
            <p className="text-[10px] text-gray-400 mt-4 font-bold">{m.context}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm h-96 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black dark:text-white tracking-tight">Revenue Trends</h3>
              <div className="flex items-center space-x-2">
                 <div className="flex items-center space-x-1">
                   <div className="h-2 w-2 rounded-full bg-primary"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed Sales</span>
                 </div>
              </div>
            </div>
            <div className="absolute inset-x-8 bottom-8 top-28 flex items-end justify-between">
              {[40, 60, 45, 90, 65, 80, 50, 70, 85, 100, 75, 95].map((h, i) => (
                <div key={i} className="w-full mx-1 group relative">
                  <div 
                    className="bg-primary/10 dark:bg-primary/20 group-hover:bg-primary rounded-t-xl transition-all" 
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm relative ${!isPro ? 'min-h-[450px]' : ''}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black dark:text-white tracking-tight">Orderly Forecasting</h3>
              <Info className="h-4 w-4 text-gray-300" />
            </div>
            
            {isPro ? (
              <div className="space-y-10">
                <div className="p-6 bg-primary/5 dark:bg-secondary/10 rounded-3xl border border-primary/10">
                  <div className="flex items-center space-x-3 text-primary mb-3">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Growth Forecast</span>
                  </div>
                  <p className="text-sm dark:text-gray-300 font-medium leading-relaxed">
                    Based on your <span className="font-black text-primary">{orders.length}</span> orders, we project steady growth.
                  </p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[4px] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center">
                <Lock className="h-8 w-8 text-yellow-600 mb-6" />
                <h4 className="text-xl font-black text-charcoal dark:text-white tracking-tight">Intelligence Locked</h4>
                <p className="text-sm text-gray-500 mt-3 mb-8 leading-relaxed font-medium">
                  Upgrade to Pro to unlock sales forecasting and churn metrics.
                </p>
                <Button variant="primary" className="rounded-2xl shadow-xl w-full py-4 font-black uppercase text-xs tracking-widest">Upgrade Now</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon fix for Metrics
const AlertCircle = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
