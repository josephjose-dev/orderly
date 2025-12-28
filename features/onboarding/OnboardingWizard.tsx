
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { OrganizationConfig } from '../../types';
// ✅ Removed CURRENCIES import as Finance step is removed
import {
  Building2,
  Settings2,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react'; // ✅ Removed Coins, ShieldCheck, Globe
import { cn } from '../../lib/utils';

export const OnboardingWizard: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);

  const [config, setConfig] = useState<OrganizationConfig>({
    country: 'AE',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    functionalCurrency: 'AED',
    displayCurrency: 'AED',
    multiCurrencyEnabled: false,
    taxSystem: 'VAT',
    taxRate: 5,
    pricesIncludeTax: true,
    inventoryTracking: true,
    lowStockThreshold: 5,
    orderSources: ['WhatsApp', 'Manual']
  });

  const next = () => setStep(s => Math.min(s + 1, 3)); // ✅ Reduced max steps to 3
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const steps = [
    { id: 1, label: 'Organization', icon: Building2 },
    // ✅ Removed Finance (Step 2)
    // ✅ Removed Compliance (Step 3)
    { id: 2, label: 'Operations', icon: Settings2 }, // ✅ Renumbered Operations to Step 2
    { id: 3, label: 'Launch', icon: Rocket }, // ✅ Renumbered Launch to Step 3
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors duration-500">
      {/* Stepper */}
      <div className="max-w-2xl w-full mb-12 flex justify-between items-center px-4">
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center space-y-2">
              <div className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                step >= s.id ? "bg-primary text-white shadow-lg" : "bg-white dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800"
              )}>
                {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-widest", step === s.id ? "text-primary" : "text-gray-400")}>{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn("h-0.5 flex-1 mx-4 rounded-full", step > s.id ? "bg-primary" : "bg-gray-200 dark:bg-gray-800")}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Card */}
      <div className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex-1 p-10">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h2 className="text-2xl font-black dark:text-white tracking-tight">Organization Setup</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Let's set the foundation for <span className="text-primary font-bold">{user?.organizationName}</span>.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Country of Operation</label>
                  <select
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 font-bold text-sm dark:text-white"
                    value={config.country}
                    onChange={(e) => setConfig({ ...config, country: e.target.value })}
                  >
                    <option value="AE">United Arab Emirates</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Language</label>
                  <div className="flex space-x-3">
                    {['English', 'Arabic', 'Hindi', 'Spanish'].map(lang => (
                      <button
                        key={lang}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold border transition-all",
                          config.language === lang.toLowerCase().slice(0, 2) ? "bg-primary text-white border-primary shadow-md" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500"
                        )}
                        onClick={() => setConfig({ ...config, language: lang.toLowerCase().slice(0, 2) })}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Removed Finance (Step 2) */}
          {/* ✅ Removed Compliance (Step 3) */}

          {step === 2 && ( // ✅ Operations is now Step 2
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h2 className="text-2xl font-black dark:text-white tracking-tight">Operations</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Fine-tune how your workspace functions.</p>
              </div>
              <div className="space-y-4">
                {[
                  { id: 'inventory', label: 'Inventory Tracking', desc: 'Auto-deduct stock on order completion', checked: config.inventoryTracking },
                  { id: 'taxInc', label: 'Tax-Inclusive Pricing', desc: 'Displayed prices already include tax', checked: config.pricesIncludeTax }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setConfig({ ...config, [opt.id === 'inventory' ? 'inventoryTracking' : 'pricesIncludeTax']: !opt.checked })}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                      opt.checked ? "bg-primary/5 border-primary" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold dark:text-white">{opt.label}</p>
                      <p className="text-[10px] text-gray-400">{opt.desc}</p>
                    </div>
                    <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", opt.checked ? "border-primary bg-primary" : "border-gray-200")}>
                      {opt.checked && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && ( // ✅ Launch is now Step 3
            <div className="space-y-8 text-center animate-in zoom-in duration-500">
              <div className="h-24 w-24 bg-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-6 mb-10">
                <Rocket className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black dark:text-white tracking-tight">Launch Workspace</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium px-4">Everything is set up. Your DM-led business engine is ready for action.</p> // ✅ Removed currency reference
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] text-left space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Region</span> // ✅ Changed label from Currency
                  <span className="text-primary">{config.country}</span> // ✅ Showing country instead of currency
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Inventory</span> // ✅ Changed label
                  <span className="text-primary">{config.inventoryTracking ? 'Auto-Track' : 'Manual'}</span> // ✅ Using user-friendly labels
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Access Level</span> // ✅ New label for demo mode
                  <span className="text-primary">Unlimited (Beta)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          {step > 1 && step < 3 ? ( // ✅ Updated condition for step 3
            <button
              onClick={prev}
              className="text-sm font-bold text-gray-400 hover:text-charcoal dark:hover:text-white flex items-center transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </button>
          ) : <div />}

          {step < 3 ? ( // ✅ Updated condition for step 3
            <Button onClick={next} className="rounded-2xl px-10 py-4 font-black shadow-lg">
              Next Step
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-2xl py-5 font-black text-lg shadow-xl"
              onClick={() => completeOnboarding(config)}
            >
              Enter Workspace // ✅ Updated button label
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
