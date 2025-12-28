
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { CreditCard, CheckCircle2, Zap, Shield, ArrowUpCircle, Crown, Info, CheckCircle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { SubscriptionPlan } from '../../types';

export const BillingDashboard: React.FC = () => {
  const { user, upgradePlan, isLoading } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const currency = user?.currency || 'USD';
  const currentPlan = user?.subscriptionPlan || 'free';

  // Plan Hierarchy Logic
  const planHierarchy: Record<SubscriptionPlan, number> = {
    'free': 0,
    'business': 1,
    'pro': 2
  };

  const getPlanPrice = (baseUsd: number) => {
    const exchangeRates: Record<string, number> = {
      'AED': 3.67,
      'INR': 83.0,
      'USD': 1.0
    };
    const rate = exchangeRates[currency] || 1.0;
    return baseUsd * rate;
  };

  const plans = [
    { 
      id: 'free' as SubscriptionPlan,
      name: 'Free', 
      price: 0, 
      tagline: 'Essential tools for micro-businesses.',
      features: ['Up to 50 orders/mo', 'Basic Inventory', 'WhatsApp Sync'],
      icon: Zap,
      color: 'gray'
    },
    { 
      id: 'business' as SubscriptionPlan,
      name: 'Business', 
      price: 29, 
      tagline: 'Professional tools for growing teams.',
      features: ['Unlimited orders', 'Analytics Dashboard', 'Up to 3 Staff', 'Inventory Alerts'],
      icon: Shield,
      popular: true,
      color: 'primary'
    },
    { 
      id: 'pro' as SubscriptionPlan,
      name: 'Pro', 
      price: 79, 
      tagline: 'High-volume scale & intelligence suite.',
      features: ['Advanced Analytics', 'Unlimited Staff', 'Invoicing Tools', 'AI Forecasting', 'Priority Support'],
      icon: Crown,
      color: 'pro'
    },
  ];

  const handleUpgrade = async (planId: SubscriptionPlan) => {
    await upgradePlan(planId);
    setSuccessMsg(`Successfully upgraded to ${planId.toUpperCase()}!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black dark:text-white tracking-tight">Plans & Billing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-lg">
            Choose the best plan for your business size. Prices are calculated in your currency (<span className="text-primary font-bold">{currency}</span>).
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          {successMsg && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl flex items-center animate-in slide-in-from-top-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-xs font-bold uppercase tracking-widest">{successMsg}</span>
            </div>
          )}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-6 py-3 rounded-2xl flex items-center shadow-sm">
             <div className="h-2 w-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Status:</span>
             <span className="text-sm font-black text-charcoal dark:text-white capitalize">{currentPlan} Plan Active</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isActive = currentPlan === plan.id;
          const isHigher = planHierarchy[plan.id] > planHierarchy[currentPlan];
          const isLower = planHierarchy[plan.id] < planHierarchy[currentPlan];
          
          return (
            <div 
              key={plan.id} 
              className={cn(
                "bg-white dark:bg-gray-900 rounded-[3rem] p-10 border-2 transition-all relative flex flex-col group",
                isActive 
                  ? "border-primary shadow-2xl ring-4 ring-primary/5" 
                  : "border-gray-50 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700",
                plan.popular && !isActive && "shadow-xl border-secondary/20"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center whitespace-nowrap">
                  <ArrowUpCircle className="h-3 w-3 mr-2" />
                  Most Popular for SMEs
                </div>
              )}

              {isActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                  Your Current Plan
                </div>
              )}
              
              <div className={cn(
                "h-16 w-16 rounded-3xl mb-10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-inner",
                isActive ? "bg-primary text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-primary"
              )}>
                <plan.icon className="h-8 w-8" />
              </div>

              <h3 className="text-3xl font-black dark:text-white tracking-tight">{plan.name}</h3>
              <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed min-h-[40px]">{plan.tagline}</p>
              
              <div className="flex items-baseline mt-8 mb-10 border-b border-gray-50 dark:border-gray-800 pb-8">
                <span className="text-5xl font-black dark:text-white tracking-tighter">
                  {formatCurrency(getPlanPrice(plan.price), currency)}
                </span>
                <span className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest">/ Month</span>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">What's included:</p>
                <ul className="space-y-5 mb-12">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm dark:text-gray-300">
                      <CheckCircle2 className={cn("h-5 w-5 mt-0.5 flex-shrink-0", isActive ? "text-primary" : "text-green-500")} />
                      <span className="font-semibold leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SaaS Upgrade Logic */}
              <div className="mt-auto">
                {isActive ? (
                  <div className="space-y-3">
                    <Button 
                      disabled 
                      variant="outline" 
                      className="w-full py-6 rounded-[1.5rem] text-sm font-black border-2 border-primary/20 bg-primary/5 text-primary opacity-100"
                    >
                      Active Subscription
                    </Button>
                  </div>
                ) : isHigher ? (
                  <Button 
                    variant={plan.id === 'pro' ? 'primary' : 'secondary'}
                    isLoading={isLoading}
                    onClick={() => handleUpgrade(plan.id)}
                    className={cn(
                      "w-full py-6 rounded-[1.5rem] text-sm font-black shadow-2xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all",
                      plan.id === 'pro' && "bg-gradient-to-r from-primary to-secondary"
                    )}
                  >
                    Upgrade to {plan.name}
                  </Button>
                ) : isLower ? (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                      Downgrades are managed through Support.
                    </p>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    isLoading={isLoading}
                    onClick={() => handleUpgrade(plan.id)}
                    className="w-full py-6 rounded-[1.5rem] text-sm font-black"
                  >
                    Select {plan.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10">
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[3rem] p-12 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black dark:text-white tracking-tight">Payment Method</h3>
              <p className="text-sm text-gray-400 font-medium">Manage how you pay for your Orderly subscription.</p>
            </div>
            <button className="text-sm font-black text-primary hover:underline underline-offset-8 uppercase tracking-widest">Update</button>
          </div>
          <div className="flex items-center justify-between p-8 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group hover:border-primary/20 transition-colors">
            <div className="flex items-center space-x-6">
              <div className="h-14 w-20 bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-black dark:text-white tracking-tight flex items-center">
                  Visa ending in •••• 4242
                  <span className="ml-3 px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg">Default</span>
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Expiry: 12/26</p>
              </div>
            </div>
            <button className="p-3 text-gray-400 hover:text-red-500 transition-colors">
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-charcoal text-white rounded-[3rem] p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tight mb-6">Need more help?</h3>
            <p className="text-white/60 text-sm font-medium leading-relaxed mb-10">
              Our enterprise team can help with custom seat pricing, consolidated invoicing, and VAT-exclusive contracts.
            </p>
          </div>
          <Button variant="secondary" className="w-full bg-white text-charcoal hover:bg-white/90 rounded-[1.5rem] py-5 font-black text-sm relative z-10">
            Speak to Sales
          </Button>
        </div>
      </div>
    </div>
  );
};
