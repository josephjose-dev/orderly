
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { useInventory } from '../../hooks/useInventory';
import { Sun, Moon, LogOut, Bell, Search, Package, ShoppingCart, ArrowRight } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

interface TopbarProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleTheme, isDarkMode }) => {
  const { user, logout } = useAuth();
  const { organization } = useOrganization();
  const { products, orders } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search logic querying the live state
  const results = searchQuery.length > 1 ? [
    ...products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(p => ({ 
      type: 'product', 
      id: p.id, 
      title: p.name, 
      subtitle: `SKU: ${p.sku} • ${formatCurrency(p.price, organization.currency)}`, 
      icon: Package 
    })),
    ...orders.filter(o => 
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(o => ({ 
      type: 'order', 
      id: o.id, 
      title: o.id, 
      subtitle: `Customer: ${o.customerName} • ${formatCurrency(o.total, organization.currency)}`, 
      icon: ShoppingCart 
    }))
  ] : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={i} className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-200 px-0.5 rounded">{part}</span> 
        : part
    );
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center space-x-4 flex-1">
        <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 hidden lg:block uppercase tracking-widest whitespace-nowrap">
          {organization.name}
        </h2>
        
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block"></div>

        <div className="relative w-full max-w-xl" ref={searchRef}>
          <div className={cn(
            "flex items-center bg-gray-50 dark:bg-gray-800/50 border border-transparent px-3 py-1.5 rounded-xl transition-all duration-200 group focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/20",
            showResults && results.length > 0 && "rounded-b-none border-b-gray-200 dark:border-b-gray-700"
          )}>
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search products or orders..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-charcoal dark:text-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-2">
                {results.map((res, i) => (
                  <button
                    key={`${res.type}-${res.id}`}
                    className={cn(
                      "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                      i === selectedIndex ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <res.icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-charcoal dark:text-white truncate">
                        {highlightText(res.title, searchQuery)}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                        {res.subtitle}
                      </p>
                    </div>
                    <div className="ml-2 text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                      {res.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggleTheme}
          className="p-2 text-gray-400 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <button className="p-2 text-gray-400 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl relative transition-all duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

        <button 
          onClick={logout}
          className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
            {user?.name.charAt(0)}
          </div>
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
