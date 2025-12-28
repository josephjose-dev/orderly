
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { Button } from '../../components/ui/Button';
import { User, Building, Bell, Shield, Globe, Save, Landmark, CheckCircle2, FileText, Users, MessageCircle } from 'lucide-react';
import { CURRENCIES } from '../../constants';
import { InvoiceSettingsModal } from './InvoiceSettings';
import { StaffManagement } from './StaffManagement';
import { TaxSettings } from './TaxSettings';
import { WhatsAppSettings } from './WhatsAppSettings';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { organization, updateOrganization } = useOrganization();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState(organization.name);

  // Checks if user is admin
  const isAdmin = user?.role === 'admin';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    // Only show Invoice settings to Admins
    ...(isAdmin ? [
      { id: 'staff', label: 'Staff Management', icon: Users },
      { id: 'tax', label: 'Tax Configuration', icon: Landmark },
      { id: 'invoice', label: 'Invoice Settings', icon: FileText }
    ] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleUpdateOrg = () => {
    updateOrganization({ name: orgName });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleUpdateCurrency = (newCurrency: string) => {
    updateOrganization({ currency: newCurrency });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Configure your personal and business environment.</p>
        </div>
        {showSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl flex items-center space-x-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Settings Updated Successfully</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id
                ? 'bg-primary text-white shadow-xl translate-x-1'
                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-charcoal'
                }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="tracking-tight">{tab.label}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-10 max-w-2xl">
              <div className="flex items-center space-x-8">
                <div className="h-24 w-24 rounded-[2rem] bg-secondary flex items-center justify-center text-white text-3xl font-black shadow-xl">
                  {user?.name.charAt(0)}
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-xl tracking-tight dark:text-white">Profile Photo</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold">Update</Button>
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold text-red-500">Remove</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Account Display Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white text-sm font-bold focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Email</label>
                  <input type="email" defaultValue={user?.email} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white text-sm font-bold opacity-60 cursor-not-allowed" disabled />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Timezone & Locale</label>
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <select className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white text-sm font-bold appearance-none focus:ring-2 focus:ring-primary">
                    <option>Dubai, UAE (GST - GMT+4)</option>
                    <option>Mumbai, India (IST - GMT+5:30)</option>
                    <option>London, UK (BST - GMT+1)</option>
                    <option>New York, USA (EDT - GMT-4)</option>
                  </select>
                </div>
              </div>

              <Button className="flex items-center space-x-2 rounded-2xl py-4 px-8 font-black shadow-lg">
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </Button>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-10 max-w-2xl">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white text-sm font-bold focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Functional Currency</label>
                <div className="relative">
                  <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <select
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white text-sm font-bold appearance-none focus:ring-2 focus:ring-primary"
                    value={organization.currency}
                    onChange={(e) => handleUpdateCurrency(e.target.value)}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-gray-400 font-bold ml-1">Note: This will change how prices and analytics are displayed across the platform.</p>
              </div>

              {/* CUSTOMER PORTAL */}
              <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">Customer Portal</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1 pr-4">
                      Share this link with your customers so they can view their order history and download invoices.
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100/50 dark:bg-blue-800/30 rounded-xl">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 truncate">
                    {`${window.location.origin}/portal/${user?.id}`}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-bold rounded-xl"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/portal/${user?.id}`);
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 2000);
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="font-bold rounded-xl"
                    onClick={() => window.open(`/portal/${user?.id}`, '_blank')}
                  >
                    Open
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                <Button
                  onClick={handleUpdateOrg}
                  className="flex items-center space-x-2 rounded-2xl py-4 px-8 font-black shadow-lg"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Business Info</span>
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'staff' && isAdmin && (
            <StaffManagement />
          )}

          {/* INVOICE SETTINGS */}
          {activeTab === 'invoice' && isAdmin && (
            <InvoiceSettingsModal isOpen={true} onClose={() => setActiveTab('business')} />
          )}

          {activeTab === 'tax' && isAdmin && (
            <TaxSettings />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppSettings />
          )}

          {(activeTab === 'notifications' || activeTab === 'security') && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="h-24 w-24 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-200">
                <Shield className="h-10 w-10 text-gray-300" />
              </div>
              <div>
                <h3 className="text-xl font-black dark:text-white tracking-tight">Enterprise Controls</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-2 font-medium">These features are currently being hardened for our enterprise-tier users. Check back soon for MFA and audit logs.</p>
              </div>
              <Button variant="outline" className="rounded-xl font-black">Notify me when ready</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
