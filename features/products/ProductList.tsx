import React, { useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { formatCurrency, getStatusColor, cn, generateId } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import {
  Plus,
  Package,
  Trash2,
  Edit3,
  ShoppingCart,
  Sparkles,
  X,
  Minus,
  AlertTriangle
} from 'lucide-react';
import { Product, ProductOption } from '../../types';
import { InputModal } from '../../components/ui/InputModal';
import { useTaxConfig } from '../../hooks/useTaxConfig';
import { calculateOrderTotals } from '../../lib/taxCalculations';
import { OrderConfirmationModal } from '../orders/OrderConfirmationModal';
import { Order } from '../../types';
import { useWhatsAppNotifications } from '../whatsapp/useWhatsAppNotifications';

export const ProductList: React.FC = () => {
  const { user } = useAuth();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProducts,
    createOrder,
    loadSampleData,
    isOrderMode,
    orderCustomerName,
    stopOrderMode
  } = useInventory();

  const { taxConfig } = useTaxConfig();


  const currency = user?.currency || 'USD';
  const [lowStockOnly, setLowStockOnly] = useState(false);

  /** MANUAL ORDER MODE - now uses context instead of localStorage */
  const isManualOrderMode = isOrderMode;
  // Key format: productId or productId:optionId
  const [orderDraft, setOrderDraft] = useState<Record<string, number>>({});
  const [orderNote, setOrderNote] = useState('');
  const [confirmationOrder, setConfirmationOrder] = useState<Order | null>(null);

  /** EDIT MODAL STATE */
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editThreshold, setEditThreshold] = useState(''); // Added threshold
  const [editOptions, setEditOptions] = useState<{ id: string; label: string; stock: string; priceAdjustment: string; lowStockThreshold: string }[]>([]);

  /** ADD PRODUCT MODAL STATE */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('0');
  const [newProductThreshold, setNewProductThreshold] = useState('5'); // Added threshold
  const [hasOptions, setHasOptions] = useState(false);
  const [optionGroupName, setOptionGroupName] = useState('Size');
  const [options, setOptions] = useState<{ id: string; label: string; stock: string; priceAdjustment: string; lowStockThreshold: string }[]>([
    { id: generateId('OPT'), label: '', stock: '0', priceAdjustment: '', lowStockThreshold: '' }
  ]);

  /** OPTION PICKER MODAL (For manual order) */
  const [pickingProduct, setPickingProduct] = useState<Product | null>(null);

  /** DELETE CONFIRMATION STATE */
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const flag = localStorage.getItem('filter_low_stock');
    if (flag === 'true') {
      setLowStockOnly(true);
      localStorage.removeItem('filter_low_stock');
    }
  }, []);

  const filteredProducts = products.filter(p => {
    if (!lowStockOnly) return true;
    if (p.optionGroup?.options?.length) {
      return p.optionGroup.options.some(opt => opt.stock <= (opt.lowStockThreshold ?? p.lowStockThreshold));
    }
    return p.stock <= p.lowStockThreshold;
  });

  /** ADD PRODUCT — REPLACED PROMPT WITH CUSTOM MODAL FLOW */
  const handleAddProduct = () => {
    setNewProductName('');
    setNewProductPrice('');
    setNewProductStock('0');
    setNewProductThreshold('5');
    setHasOptions(false);
    setOptionGroupName('Size');
    setOptions([{ id: generateId('OPT'), label: '', stock: '0', priceAdjustment: '', lowStockThreshold: '' }]);
    setIsAddModalOpen(true);
  };

  const onAddSubmit = () => {
    const basePrice = Number(newProductPrice);
    const stock = Number(newProductStock);
    const threshold = Number(newProductThreshold);

    if (!newProductName) return;
    if (isNaN(basePrice) || basePrice <= 0) {
      alert('Invalid price');
      return;
    }

    const productData: any = {
      name: newProductName,
      price: basePrice,
      stock: hasOptions ? options.reduce((sum, o) => sum + Number(o.stock), 0) : stock,
      lowStockThreshold: isNaN(threshold) ? 5 : threshold
    };

    if (hasOptions) {
      productData.optionGroup = {
        label: optionGroupName,
        affectsStock: true,
        options: options.map(o => ({
          id: o.id,
          label: o.label,
          stock: Number(o.stock),
          priceAdjustment: Number(o.priceAdjustment) || 0,
          lowStockThreshold: o.lowStockThreshold ? Number(o.lowStockThreshold) : undefined
        }))
      };
    }

    addProduct(productData);
    setIsAddModalOpen(false);
  };

  /** DELETE CONFIRMATION HANDLER */
  const onDeleteConfirm = () => {
    if (productToDelete) {
      deleteProducts([productToDelete.id]);
      setProductToDelete(null);
    }
  };

  /** QUICK ORDER */
  const handleQuickOrder = (product: Product) => {
    if (product.optionGroup) {
      setPickingProduct(product);
      return;
    }
    if (product.stock <= 0) return;
    const newOrder = createOrder({
      customerName: 'Quick Order',
      whatsappNumber: '',
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price
        }
      ],
      total: product.price,
      // Default tax params implied (0 for now or handled by createOrder if it did calc, but createOrder is dumb storage. Ideally we should calculate tax here too but skipping for Quick Order simplicity as per existing logic)
      subtotal: product.price,
      taxAmount: 0,
      discount: 0
    });
    // Optional: Ask for phone if Quick Order? Skipping for Quick Order as it usually has no customer info.
    // sendOrderConfirmation(newOrder); // Disabled for Quick Order as there is no phone/name context usually.
  };

  /** SOFT RESERVE */
  const increaseQty = (product: Product, optionId?: string) => {
    const key = optionId ? `${product.id}:${optionId}` : product.id;
    const maxStock = optionId
      ? product.optionGroup?.options.find(o => o.id === optionId)?.stock || 0
      : product.stock;

    setOrderDraft(prev => {
      const current = prev[key] || 0;
      if (current >= maxStock) return prev;
      return { ...prev, [key]: current + 1 };
    });
  };

  const decreaseQty = (product: Product, optionId?: string) => {
    const key = optionId ? `${product.id}:${optionId}` : product.id;
    setOrderDraft(prev => {
      const next = { ...prev };
      if (!next[key]) return prev;
      if (next[key] === 1) delete next[key];
      else next[key] -= 1;
      return next;
    });
  };

  const createManualOrder = () => {
    if (!orderCustomerName) return;

    const items = Object.entries(orderDraft)
      .map(([key, qty]) => {
        const [productId, optionId] = key.split(':');
        const p = products.find(p => p.id === productId);
        if (!p) return null;

        let selectedOptionLabel: string | undefined;
        let finalUnitPrice = p.price;

        if (optionId && p.optionGroup) {
          const opt = p.optionGroup.options.find(o => o.id === optionId);
          selectedOptionLabel = opt?.label;
          finalUnitPrice += (opt?.priceAdjustment || 0);
        }

        return {
          productId,
          productName: p.name,
          quantity: qty,
          price: finalUnitPrice,
          selectedOptionId: optionId,
          selectedOptionLabel
        };
      })
      .filter(Boolean) as any[];

    if (!items.length) {
      alert('Select at least one product');
      return;
    }

    const totals = calculateOrderTotals(
      items,
      taxConfig,
      undefined, // Custom rate not yet supported in this UI, uses config
      0 // Discount not yet supported in this UI
    );

    const newOrder = createOrder({
      customerName: orderCustomerName,
      whatsappNumber: '',
      items,
      status: 'pending',
      ...totals,
      note: orderNote || undefined
    });

    setOrderDraft({});
    setOrderNote('');
    stopOrderMode();

    // Show Confirmation Modal
    // @ts-ignore
    setConfirmationOrder(newOrder);
  };


  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditStock(String(p.stock));
    setEditThreshold(String(p.lowStockThreshold));
    if (p.optionGroup) {
      setEditOptions(p.optionGroup.options.map(o => ({
        id: o.id || generateId('OPT'),
        label: o.label,
        stock: String(o.stock),
        priceAdjustment: String(o.priceAdjustment || ''),
        lowStockThreshold: String(o.lowStockThreshold || '')
      })));
    } else {
      setEditOptions([]);
    }
  };

  const saveEdit = () => {
    const basePrice = Number(editPrice);
    const stock = Number(editStock);
    const threshold = Number(editThreshold);

    if (!editName) return;
    if (isNaN(basePrice) || basePrice <= 0) {
      alert('Invalid price');
      return;
    }

    const updates: any = {
      name: editName,
      price: basePrice,
      lowStockThreshold: isNaN(threshold) ? 5 : threshold
    };

    if (editingProduct?.optionGroup) {
      updates.optionGroup = {
        ...editingProduct.optionGroup,
        options: editOptions.map(o => ({
          id: o.id,
          label: o.label,
          stock: Number(o.stock),
          priceAdjustment: Number(o.priceAdjustment) || 0,
          lowStockThreshold: o.lowStockThreshold ? Number(o.lowStockThreshold) : undefined
        }))
      };
      updates.stock = updates.optionGroup.options.reduce((sum, o) => sum + o.stock, 0);
    } else {
      if (isNaN(stock) || stock < 0) {
        alert('Invalid stock');
        return;
      }
      updates.stock = stock;
    }

    updateProduct(editingProduct!.id, updates);
    setEditingProduct(null);
  };

  /** Helper to validate numeric only input */
  const handleNumericInput = (val: string, setter: (v: string) => void) => {
    if (val === '' || /^\d+$/.test(val)) {
      setter(val);
    }
  };

  /** Helper for price adjustment handle */
  const handlePriceAdjustmentInput = (val: string, setter: (v: string) => void) => {
    if (val === '' || /^\d+$/.test(val)) {
      setter(val);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">
          Products {isManualOrderMode && <span className="text-sm text-gray-400">– Creating order for {orderCustomerName}</span>}
        </h1>
        <div className="flex gap-2">
          <Button variant={lowStockOnly ? 'danger' : 'outline'} onClick={() => setLowStockOnly(!lowStockOnly)}>
            {lowStockOnly ? 'Show All' : 'Low Stock Only'}
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-10 w-10 mx-auto text-gray-300" />
          <p className="mt-4 text-gray-500">No products yet</p>
          <Button className="mt-6" onClick={loadSampleData}>
            <Sparkles className="h-4 w-4 mr-2" /> Load Sample Products
          </Button>
        </div>
      ) : (
        <table className="w-full bg-white rounded-xl overflow-hidden border shadow-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400 bg-gray-50/50">
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const hasOptions = product.optionGroup && product.optionGroup.options.length > 0;

              return (
                <tr key={product.id} className="border-t hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold flex flex-col">
                    {product.name}
                    {hasOptions && (
                      <span className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-wider">
                        {product.optionGroup?.label} variation
                      </span>
                    )}
                  </td>
                  <td className="p-4">{formatCurrency(product.price, currency)}</td>
                  <td className="p-4">
                    {hasOptions ? (
                      <div className="flex flex-wrap gap-2">
                        {product.optionGroup?.options.map(opt => {
                          const key = `${product.id}:${opt.id}`;
                          const selected = orderDraft[key] || 0;
                          const available = opt.stock - selected;
                          const threshold = opt.lowStockThreshold ?? product.lowStockThreshold;
                          const isLow = available <= threshold;
                          const isEmpty = available <= 0;

                          return (
                            <div key={opt.id} className={cn(
                              "px-2 py-1 rounded-lg border text-[10px] font-black flex items-center gap-1.5",
                              isEmpty ? "bg-red-50 text-red-600 border-red-200" :
                                isLow ? "bg-orange-50 text-orange-600 border-orange-200" :
                                  "bg-gray-50 text-gray-600 border-gray-100"
                            )}>
                              {opt.label}: {available}
                              {isLow && <AlertTriangle className="h-2 w-2" />}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      (() => {
                        const selected = orderDraft[product.id] || 0;
                        const available = product.stock - selected;
                        const isLow = available <= product.lowStockThreshold;
                        const isEmpty = available <= 0;
                        return (
                          <span className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-2',
                            isEmpty ? "bg-red-50 text-red-600 border border-red-200" :
                              isLow ? "bg-orange-50 text-orange-600 border border-orange-200" :
                                "bg-green-50 text-green-600 border border-green-200"
                          )}>
                            {available} {isLow && <AlertTriangle className="h-3 w-3" />}
                          </span>
                        );
                      })()
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {isManualOrderMode && (
                      !hasOptions ? (
                        <div className="inline-flex items-center gap-2 bg-gray-50 p-1 rounded-xl border">
                          <button onClick={() => decreaseQty(product)} className="p-1 hover:bg-white rounded-lg transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black">{orderDraft[product.id] || 0}</span>
                          <button
                            onClick={() => increaseQty(product)}
                            disabled={(product.stock - (orderDraft[product.id] || 0)) <= 0}
                            className="p-1 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="bg-primary text-white text-[10px] px-3 py-1.5 rounded-xl font-black shadow-sm shadow-primary/20"
                          onClick={() => setPickingProduct(product)}
                        >
                          SELECT
                        </button>
                      )
                    )}
                    <button onClick={() => openEdit(product)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setProductToDelete(product)} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {isManualOrderMode && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-2xl border">
            <label className="text-xs font-black uppercase text-gray-400 block mb-2">Customer notes (optional)</label>
            <textarea
              className="w-full border rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              rows={3}
              value={orderNote}
              onChange={e => setOrderNote(e.target.value)}
              placeholder="e.g. Less sugar, extra sauce, no ice"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={createManualOrder} size="lg" className="shadow-lg shadow-primary/20">
              Confirm Order Items
            </Button>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6">Add New Product</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1">Product Name</label>
                <input
                  autoFocus
                  className="w-full border rounded-xl px-4 py-2"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  placeholder="e.g. Cold Brew"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-1">Base Price</label>
                  <input
                    type="number"
                    className="w-full border rounded-xl px-4 py-2"
                    value={newProductPrice}
                    onChange={e => setNewProductPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {!hasOptions ? (
                  <div>
                    <label className="text-xs font-black uppercase text-gray-400 block mb-1">Total Stock</label>
                    <input
                      className="w-full border rounded-xl px-4 py-2"
                      value={newProductStock === '0' ? '' : newProductStock}
                      onChange={e => handleNumericInput(e.target.value, setNewProductStock)}
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-black uppercase text-gray-400 block mb-1">Default Alert At</label>
                    <input
                      className="w-full border rounded-xl px-4 py-2"
                      value={newProductThreshold}
                      onChange={e => handleNumericInput(e.target.value, setNewProductThreshold)}
                      placeholder="5"
                    />
                  </div>
                )}
              </div>

              {!hasOptions && (
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-1">Stock Alert At</label>
                  <input
                    className="w-full border rounded-xl px-4 py-2"
                    value={newProductThreshold}
                    onChange={e => handleNumericInput(e.target.value, setNewProductThreshold)}
                  />
                </div>
              )}

              <div className="pt-4 border-t">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={hasOptions}
                    onChange={e => setHasOptions(e.target.checked)}
                  />
                  <span className="text-sm font-bold group-hover:text-primary transition-colors">This product has variations</span>
                </label>
              </div>

              {hasOptions && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border">
                  <div>
                    <label className="text-xs font-black uppercase text-gray-400 block mb-1">Option Group</label>
                    <input
                      className="w-full border rounded-xl px-4 py-2"
                      value={optionGroupName}
                      onChange={e => setOptionGroupName(e.target.value)}
                      placeholder="e.g. Size"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 mb-1">
                      <label className="col-span-5 text-[10px] font-black uppercase text-gray-400">Label</label>
                      <label className="col-span-2 text-[10px] font-black uppercase text-gray-400">Stock</label>
                      <label className="col-span-2 text-[10px] font-black uppercase text-gray-400">Price+</label>
                      <label className="col-span-2 text-[10px] font-black uppercase text-gray-400">Alert</label>
                    </div>
                    {options.map((opt, idx) => (
                      <div key={opt.id} className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <input
                            className="w-full border rounded-xl px-3 py-1.5 text-xs font-bold"
                            value={opt.label}
                            onChange={e => {
                              const next = [...options];
                              next[idx].label = e.target.value;
                              setOptions(next);
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full border rounded-xl px-3 py-1.5 text-xs"
                            value={opt.stock === '0' ? '' : opt.stock}
                            onChange={e => handleNumericInput(e.target.value, (v) => {
                              const next = [...options];
                              next[idx].stock = v;
                              setOptions(next);
                            })}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full border rounded-xl px-3 py-1.5 text-xs"
                            value={opt.priceAdjustment}
                            onChange={e => handlePriceAdjustmentInput(e.target.value, (v) => {
                              const next = [...options];
                              next[idx].priceAdjustment = v;
                              setOptions(next);
                            })}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full border rounded-xl px-3 py-1.5 text-xs text-orange-600"
                            value={opt.lowStockThreshold}
                            onChange={e => handleNumericInput(e.target.value, (v) => {
                              const next = [...options];
                              next[idx].lowStockThreshold = v;
                              setOptions(next);
                            })}
                            placeholder="Default"
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            className="text-red-400 hover:text-red-600"
                            onClick={() => setOptions(options.filter((o) => o.id !== opt.id))}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="text-xs font-bold text-primary flex items-center gap-1 mt-1"
                      onClick={() => setOptions([...options, { id: generateId('OPT'), label: '', stock: '0', priceAdjustment: '', lowStockThreshold: '' }])}
                    >
                      <Plus className="h-3 w-3" /> New variation
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={onAddSubmit}>Save Product</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPTION PICKER MODAL */}
      {pickingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-sm:w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Select {pickingProduct.optionGroup?.label}</h3>
              <button onClick={() => setPickingProduct(null)}><X className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>
            </div>
            <div className="space-y-3">
              {pickingProduct.optionGroup?.options.map(opt => {
                const key = `${pickingProduct.id}:${opt.id}`;
                const selected = orderDraft[key] || 0;
                const available = opt.stock - selected;
                const isLow = available <= (opt.lowStockThreshold ?? pickingProduct.lowStockThreshold);

                return (
                  <div key={opt.id} className={cn(
                    "flex items-center justify-between p-4 border rounded-2xl transition-colors",
                    available <= 0 ? "bg-red-50/50 border-red-100" : "hover:bg-gray-50"
                  )}>
                    <div>
                      <p className="font-bold flex items-center gap-2">
                        {opt.label}
                        {isLow && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                      </p>
                      <p className={cn("text-xs font-bold", available <= 0 ? "text-red-500" : "text-gray-400 tracking-tight")}>
                        {available <= 0 ? 'OUT OF STOCK' : `${available} in stock`}
                      </p>
                      {opt.priceAdjustment ? (
                        <p className="text-[10px] text-primary font-black mt-0.5">+{formatCurrency(opt.priceAdjustment, currency)}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="bg-gray-100 p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all font-black"
                        onClick={() => decreaseQty(pickingProduct, opt.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-black w-4 text-center">{selected}</span>
                      <button
                        className="bg-primary text-white p-1.5 rounded-lg disabled:opacity-30 shadow-sm shadow-primary/20"
                        disabled={available <= 0}
                        onClick={() => increaseQty(pickingProduct, opt.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full mt-6 shadow-lg shadow-primary/10" onClick={() => setPickingProduct(null)}>Done</Button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <InputModal
        isOpen={Boolean(productToDelete)}
        title="Delete product?"
        description="This product may appear in past orders. Deleting it cannot be undone."
        fields={[]}
        onSubmit={onDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />

      <OrderConfirmationModal
        isOpen={Boolean(confirmationOrder)}
        onClose={() => setConfirmationOrder(null)}
        order={confirmationOrder}
      />

      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)}>
                <X className="h-5 w-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1">Product Name</label>
                <input
                  className="w-full border rounded-xl px-4 py-2"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-1">Base Price</label>
                  <input
                    type="number"
                    className="w-full border rounded-xl px-4 py-2"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                  />
                </div>
                {!editingProduct.optionGroup && (
                  <div>
                    <label className="text-xs font-black uppercase text-gray-400 block mb-1">Total Stock</label>
                    <input
                      className="w-full border rounded-xl px-4 py-2"
                      value={editStock === '0' ? '' : editStock}
                      onChange={e => handleNumericInput(e.target.value, setEditStock)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-1">Standard Alert At</label>
                <input
                  className="w-full border rounded-xl px-4 py-2"
                  value={editThreshold}
                  onChange={e => handleNumericInput(e.target.value, setEditThreshold)}
                />
              </div>

              {editingProduct.optionGroup && (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-black uppercase text-gray-400 block">Variation Details</label>
                  <div className="bg-gray-50 rounded-2xl p-4 border space-y-2">
                    <div className="grid grid-cols-12 gap-2 mb-1">
                      <label className="col-span-4 text-[10px] font-black uppercase text-gray-400">Label</label>
                      <label className="col-span-3 text-[10px] font-black uppercase text-gray-400">Stock</label>
                      <label className="col-span-2 text-[10px] font-black uppercase text-gray-400">P+</label>
                      <label className="col-span-3 text-[10px] font-black uppercase text-gray-400">Alert</label>
                    </div>
                    {editOptions.map((opt, idx) => (
                      <div key={opt.id} className="grid grid-cols-12 gap-2 items-center">
                        <span className="col-span-4 text-xs font-bold truncate">{opt.label}</span>
                        <div className="col-span-3">
                          <input
                            className="w-full border rounded-xl px-2 py-1.5 text-xs"
                            value={opt.stock === '0' ? '' : opt.stock}
                            onChange={e => handleNumericInput(e.target.value, (v) => {
                              const next = [...editOptions];
                              next[idx].stock = v;
                              setEditOptions(next);
                            })}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full border rounded-xl px-2 py-1.5 text-xs"
                            value={opt.priceAdjustment}
                            onChange={e => handlePriceAdjustmentInput(e.target.value, (v) => {
                              const next = [...editOptions];
                              next[idx].priceAdjustment = v;
                              setEditOptions(next);
                            })}
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            className="w-full border rounded-xl px-2 py-1.5 text-xs text-orange-600"
                            value={opt.lowStockThreshold}
                            onChange={e => handleNumericInput(e.target.value, (v) => {
                              const next = [...editOptions];
                              next[idx].lowStockThreshold = v;
                              setEditOptions(next);
                            })}
                            placeholder="Def"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-6">
                <Button variant="outline" className="flex-1" onClick={() => setEditingProduct(null)}>Cancel</Button>
                <Button className="flex-1" onClick={saveEdit}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
