
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ChevronRight, ChevronLeft, CheckCircle, Package, ShoppingCart, MessageSquare, Target, HelpCircle } from 'lucide-react';

interface BeginnerGuideProps {
  onComplete?: () => void;
}

export const BeginnerGuide: React.FC<BeginnerGuideProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const { completeOnboarding } = useAuth();

  const handleComplete = () => {
    completeOnboarding();
    if (onComplete) onComplete();
  };


  const steps = [
    {
      title: 'Welcome to Orderly',
      subtitle: 'Manage customer orders from all your DMs — in one place',
      desc: 'Orderly helps you track orders, products, and stock when customers message you to buy — whether the message comes from WhatsApp, Instagram, Facebook, Telegram, or website chat.\n\nYou continue chatting in the apps you already use. Orderly only helps you stay organized so nothing gets missed.',
      icon: CheckCircle,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'How it fits into your workflow',
      desc: '1. Customer messages you on any app\n2. You confirm the order in chat\n3. You add the order to Orderly\n4. Orderly tracks stock and order status\n\nOrderly does not replace your chat apps. It works alongside them to act as your central place to stay organized.',
      isNotSection: true,
      icon: MessageSquare,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Step 1: Add your products',
      desc: 'Go to the Products tab to add items you sell and set your initial stock quantities. This prevents overselling by giving you a real-time view of your inventory across all your selling channels.',
      icon: Package,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Step 2 & 3: Manage your sales',
      desc: 'When a customer DMs you on any platform, create an order in Orderly. Stock updates automatically, and you can track every order from Pending to Completed. Perfect for high-volume DM businesses.',
      icon: Target,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="md:w-1/2 relative bg-primary">
          <img src={steps[step].image} alt="Step visual" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10 right-10">
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6">
              {React.createElement(steps[step].icon, { className: 'h-6 w-6 text-white' })}
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              {steps[step].title}
            </h2>
            {steps[step].subtitle && (
              <p className="text-white/80 mt-2 text-sm font-medium">{steps[step].subtitle}</p>
            )}
          </div>
        </div>

        <div className="md:w-1/2 p-12 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex space-x-2">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 rounded-full flex-1 transition-all ${i === step ? 'bg-secondary' : 'bg-gray-100 dark:bg-gray-800'}`}></div>
              ))}
            </div>

            <div className="space-y-6 pt-8">
              <div className="prose prose-sm dark:prose-invert">
                {steps[step].desc.split('\n').map((line, i) => (
                  <p key={i} className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-2">
                    {line}
                  </p>
                ))}
              </div>

              {steps[step].isNotSection && (
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Orderly IS:</p>
                    <ul className="text-[11px] font-bold text-gray-500 space-y-1">
                      <li>• DM order tracking</li>
                      <li>• Inventory manager</li>
                      <li>• Central organization</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Orderly is NOT:</p>
                    <ul className="text-[11px] font-bold text-gray-400 space-y-1">
                      <li>• A chat app</li>
                      <li>• WhatsApp replacement</li>
                      <li>• Automated bot</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              {step > 0 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center text-sm font-bold text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </button>
              ) : <div></div>}

              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(s => s + 1)} className="group rounded-xl">
                  Continue
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button variant="primary" size="lg" className="rounded-xl shadow-xl font-black px-8" onClick={handleComplete}>
                  Add your first product
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <HelpCircle className="h-3 w-3 flex-shrink-0" />
              <span>Orderly works with WhatsApp, Instagram, Facebook, Telegram, and any platform where customers message you.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
