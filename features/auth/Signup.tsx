
import React, { useState, useMemo, useEffect } from 'react'; // ✅ Added useEffect
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { BusinessRegion } from '../../types';
import { Check, Zap, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SignupProps {
  onToggleForm: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onToggleForm }) => {
  const { signup, isLoading } = useAuth();
  const [bizName, setBizName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // ✅ Replaced region state with currency state
  const [currency, setCurrency] = useState('USD');
  const [isCurrencyManual, setIsCurrencyManual] = useState(false);

  // Local error state for top-level submission failures
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ Added auto-select logic for currency based on phone number
  useEffect(() => {
    if (isCurrencyManual) return;
    if (phoneNumber.startsWith('+91')) {
      setCurrency('INR');
    } else if (phoneNumber.startsWith('+971')) {
      setCurrency('AED');
    } else {
      setCurrency('USD');
    }
  }, [phoneNumber, isCurrencyManual]);

  // Phone prefix logic
  const phonePlaceholder = useMemo(() => {
    // ✅ Updated to use currency (or fixed logic) instead of region hint
    if (currency === 'AED') return '+971 5X XXX XXXX';
    if (currency === 'INR') return '+91 XXXX XXXXXX';
    return '+X XXX XXX XXXX';
  }, [currency]);

  const phoneError = useMemo(() => {
    if (!phoneNumber) return '';

    // ✅ Updated validation logic to be currency-aware if needed
    if (currency === 'AED' && !phoneNumber.startsWith('+971')) {
      return 'UAE phone numbers must start with +971';
    }
    if (currency === 'INR' && !phoneNumber.startsWith('+91')) {
      return 'India phone numbers must start with +91';
    }

    if (!phoneNumber.startsWith('+')) {
      return 'International numbers must start with +';
    }
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return 'Phone must contain 8-15 digits total';
    }

    return '';
  }, [phoneNumber, currency]);

  const passwordError = useMemo(() => {
    if (!confirmPassword) return '';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (password.length > 0 && password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }, [password, confirmPassword]);

  const isValid = useMemo(() => {
    return (
      bizName.trim().length > 0 &&
      email.includes('@') &&
      phoneNumber.length >= 8 &&
      !phoneError &&
      password.length >= 6 &&
      password === confirmPassword
    );
  }, [bizName, email, phoneNumber, phoneError, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isValid) {
      setSubmitError('Please correct the errors in the form before continuing.');
      return;
    }

    try {
      // ✅ Mapping currency selection back to existing BusinessRegion type
      const regionMap: Record<string, BusinessRegion> = {
        'INR': 'IN',
        'AED': 'UAE',
        'USD': 'GLOBAL',
        'EUR': 'GLOBAL'
      };

      await signup(
        bizName.trim(),
        email.trim(),
        phoneNumber.trim(),
        'business',
        regionMap[currency] || 'GLOBAL'
      );
    } catch (err) {
      setSubmitError('Failed to create account. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl -rotate-3">
            <span className="text-white font-black text-2xl tracking-tighter">O.</span>
          </div>
          <h1 className="text-4xl font-black text-charcoal tracking-tight">Scale your business</h1>
          <p className="text-gray-500 mt-2 text-lg">Join the future of global DM-led commerce.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 pointer-events-auto">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-bold">{submitError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Business Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-medium pointer-events-auto"
                    placeholder="The Coffee Roasters"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    disabled={false}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-medium pointer-events-auto"
                    placeholder="owner@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={false}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {/* ✅ Replaced Business Region with Business Currency */}
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Business Currency</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-medium appearance-none"
                      value={currency}
                      onChange={(e) => {
                        setCurrency(e.target.value);
                        setIsCurrencyManual(true); // ✅ Prevent auto-override after manual change
                      }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">WhatsApp Phone</label>
                    <input
                      type="text"
                      required
                      className={cn(
                        "w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 text-sm font-medium",
                        phoneError ? "ring-2 ring-red-500" : "focus:ring-primary"
                      )}
                      placeholder={phonePlaceholder}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={false}
                    />
                  </div>
                </div>
                {phoneError && (
                  <div className="flex items-center space-x-1 text-[10px] text-red-500 font-bold uppercase tracking-tight ml-1 animate-in slide-in-from-left-2">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{phoneError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-medium"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={false}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      className={cn(
                        "w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 text-sm font-medium",
                        passwordError ? "ring-2 ring-red-500" : "focus:ring-primary"
                      )}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={false}
                    />
                  </div>
                </div>
                {passwordError && (
                  <div className="flex items-center space-x-1 text-[10px] text-red-500 font-bold uppercase tracking-tight ml-1 animate-in slide-in-from-left-2">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight bg-gray-50 p-3 rounded-xl">
                  <Info className="h-3 w-3 flex-shrink-0" />
                  {/* ✅ Updated helper text */}
                  <span>Used for product prices, orders, and reports.</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Membership Status</label>
              <div className="bg-primary/5 border-2 border-primary rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>

                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-charcoal leading-none">Early Access Beta</h3>
                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Limited Time Opportunity</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    "First 100 users get unlimited access during beta",
                    "Founding users will receive discounted pricing when billing launches",
                    "Full access to all current and upcoming features"
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-xs font-bold text-gray-600 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-primary/10">
                    <p className="text-[10px] font-bold text-gray-400 italic">"Join the circle of early adopters building the next generation of conversational commerce."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full py-5 text-lg font-black rounded-2xl shadow-lg"
              isLoading={isLoading}
              disabled={isLoading || !isValid}
              size="lg"
            >
              Join Early Access
            </Button>

            <div className="flex items-center justify-center space-x-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="flex items-center"><Check className="h-3 w-3 mr-1.5 text-accent" /> No Credit Card Required</span>
              <span className="flex items-center"><Check className="h-3 w-3 mr-1.5 text-accent" /> Immediate Access</span>
            </div>
          </div>

          <div className="pt-8 text-center border-t border-gray-50 mt-8">
            <p className="text-sm text-gray-400">
              Already have an account?
              <button type="button" onClick={onToggleForm} className="ml-1 text-primary font-bold hover:underline">Log in</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
