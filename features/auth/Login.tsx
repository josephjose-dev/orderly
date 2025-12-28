
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';

interface LoginProps {
  onToggleForm: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleForm }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('demo@orderly.com');
  const [pass, setPass] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, pass);
  };

  // ✅ DEFENSIVE FIX: Force unlock body and interactions
  React.useEffect(() => {
    // Reset any potential body locks
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.userSelect = 'auto';

    // Auto-focus email for convenience and to test focusability
    const timer = setTimeout(() => {
      const emailInput = document.getElementById('login-email');
      if (emailInput) emailInput.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans relative z-[999]">
      <div className="max-w-md w-full relative z-[1000]">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
            <span className="text-white font-black text-2xl tracking-tighter">O.</span>
          </div>
          <h1 className="text-3xl font-bold text-charcoal tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your WhatsApp empire.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 space-y-6 pointer-events-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Work Email</label>
              <input
                id="login-email"
                type="email"
                required
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-medium pointer-events-auto"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={false}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary text-sm font-medium pointer-events-auto"
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                disabled={false}
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-4 text-sm font-bold rounded-2xl" isLoading={isLoading}>
            Sign In
          </Button>

          <div className="pt-4 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?
              <button type="button" onClick={onToggleForm} className="ml-1 text-primary font-bold hover:underline">Create for Free</button>
            </p>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2 grayscale opacity-50">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-charcoal">Trusted by 500+ Local SMEs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
