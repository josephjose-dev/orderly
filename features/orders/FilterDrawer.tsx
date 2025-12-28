
import React, { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Button } from '../../components/ui/Button';
import { 
  X, 
  Search, 
  Package, 
  CreditCard, 
  Smartphone, 
  History,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  minAmount: string;
  setMinAmount: (val: string) => void;
  maxAmount: string;
  setMaxAmount: (val: string) => void;
  selectedProducts: string[];
  setSelectedProducts: (val: string[]) => void;
  currency: string;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  selectedProducts,
  setSelectedProducts,
  currency
}) => {
  const { products } = useInventory();
  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 5);

  const toggleProduct = (id: string) => {
    setSelectedProducts(
      selectedProducts.includes(id) 
        ? selectedProducts.filter(i => i !== id) 
        : [...selectedProducts, id]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[60] animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100 dark:border-gray-800">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Advanced Settings</p>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Filters</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Order Value Filter */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center space-x-2">
              <CreditCard className="h-3 w-3" />
              <span>Order Value Range ({currency})</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                 />
                 <span className="text-[9px] text-gray-400 font-bold px-1 uppercase">Minimum</span>
               </div>
               <div className="space-y-1">
                 <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                 />
                 <span className="text-[9px] text-gray-400 font-bold px-1 uppercase">Maximum</span>
               </div>
            </div>
          </section>

          {/* Product Filter */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center space-x-2">
              <Package className="h-3 w-3" />
              <span>Contains Products</span>
            </h4>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-primary"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2 mt-4">
              {filteredProducts.map(p => {
                const isSelected = selectedProducts.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all border",
                      isSelected ? "bg-primary border-primary text-white" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn("h-6 w-6 rounded flex items-center justify-center font-black text-[10px]", isSelected ? "bg-white/10" : "bg-gray-100")}>
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold truncate max-w-[150px]">{p.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        <div className="p-8 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex flex-col space-y-3">
          <Button 
            className="w-full rounded-2xl py-4 font-black text-sm shadow-xl"
            onClick={onClose}
          >
            Show Filtered Results
          </Button>
          <button 
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors py-2"
            onClick={() => { setSelectedProducts([]); setMinAmount(''); setMaxAmount(''); }}
          >
            Reset All Filters
          </button>
        </div>
      </div>
    </>
  );
};
