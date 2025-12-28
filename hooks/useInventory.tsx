import React, { createContext, useContext, useEffect, useState, useRef } from 'react'; // ✅ Restored React imports
import { Product, Order, OrderStatus } from '../types';
import { useAuth } from './useAuth';
import { generateId } from '../lib/utils';

const INVENTORY_KEY_PREFIX = 'inventory:';
const ORDERS_KEY_PREFIX = 'orders:';

// ✅ Added Context definition
const InventoryContext = createContext<any>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { // ✅ Restored Provider
  const { user } = useAuth();
  const organizationId = user?.organizationId;

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const hydratedOrgId = useRef<string | null>(null); // ✅ Hydration guard ref

  // ✅ Order Mode State - single source of truth for cart visibility
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [orderCustomerName, setOrderCustomerName] = useState<string | null>(null);

  const inventoryKey = organizationId
    ? `${INVENTORY_KEY_PREFIX}${organizationId}`
    : null;

  const ordersKey = organizationId
    ? `${ORDERS_KEY_PREFIX}${organizationId}`
    : null;

  /* ============================
   * INITIAL LOAD (HYDRATION GUARD)
   * ============================ */
  useEffect(() => {
    if (!organizationId) {
      setProducts([]);
      setOrders([]);
      setIsInitialized(false);
      hydratedOrgId.current = null;
      return;
    }

    // ✅ Load ONLY ONCE per organizationId
    if (hydratedOrgId.current === organizationId) return;

    const storedProducts = localStorage.getItem(inventoryKey!);
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts([]);
    }

    const storedOrders = localStorage.getItem(ordersKey!);
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders([]);
    }

    setIsInitialized(true);
    hydratedOrgId.current = organizationId;
  }, [organizationId, inventoryKey, ordersKey]);

  /* ============================
   * PERSISTENCE
   * ============================ */
  useEffect(() => {
    if (!inventoryKey || !isInitialized) return; // ✅ Guard persistence until initialized
    localStorage.setItem(inventoryKey, JSON.stringify(products));
  }, [products, inventoryKey, isInitialized]);

  useEffect(() => {
    if (!ordersKey || !isInitialized) return; // ✅ Guard persistence until initialized
    localStorage.setItem(ordersKey, JSON.stringify(orders));
  }, [orders, ordersKey, isInitialized]);

  /* ============================
   * PRODUCTS
   * ============================ */
  const addProduct = (
    product: Omit<Product, 'id' | 'sku' | 'status' | 'lastUpdated'>
  ) => {
    const now = new Date().toISOString();

    setProducts(prev => [
      {
        ...product,
        id: generateId('PRD'),
        sku: generateId('SKU'),
        status: 'active',
        lastUpdated: now
      },
      ...prev
    ]);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();

    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, ...updates, lastUpdated: now }
          : p
      )
    );
  };

  const deleteProducts = (productIds: string[]) => {
    setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
  };

  /* ============================
   * ORDERS
   * ============================ */
  /* ============================
   * ORDERS
   * ============================ */
  const createOrder = (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    // Generate ID and Timestamp upfront
    const newOrder: Order = {
      ...order,
      id: generateId('ORD'),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setProducts(prevProducts =>
      prevProducts.map(product => {
        const relevantItems = order.items.filter(i => i.productId === product.id);
        if (relevantItems.length === 0) return product;

        let updatedProduct = { ...product };
        const hasOptions = updatedProduct.optionGroup && updatedProduct.optionGroup.options.length > 0;

        if (hasOptions) {
          // Rule: Deduct ONLY from options if they exist
          updatedProduct.optionGroup = {
            ...updatedProduct.optionGroup!,
            options: updatedProduct.optionGroup!.options.map(opt => {
              const itemForThisOption = relevantItems.filter(i => i.selectedOptionId === opt.id);
              const totalQty = itemForThisOption.reduce((sum, i) => sum + i.quantity, 0);
              return totalQty > 0 ? { ...opt, stock: opt.stock - totalQty } : opt;
            })
          };
          // Sync main stock as sum of options for UI consistency (but logic relies on options)
          updatedProduct.stock = updatedProduct.optionGroup.options.reduce((sum, o) => sum + o.stock, 0);
        } else {
          // Standard product: deduct from main stock
          const totalQty = relevantItems.reduce((sum, i) => sum + i.quantity, 0);
          updatedProduct.stock = updatedProduct.stock - totalQty;
        }

        return updatedProduct;
      })
    );

    setOrders(prev => [newOrder, ...prev]);

    return newOrder; // ✅ Return the new order
  };

  /* ============================
   * UPDATE ORDER STATUS (SAFE)
   * ============================ */
  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    const finalUpdates = Array.isArray(updates) ? { items: updates } : updates;
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, ...finalUpdates } : o))
    );
    return { success: true, message: 'Order updated' };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Safety: Cancelled orders are FINAL and immutable
    if (order.status === 'cancelled') {
      console.warn('Cannot change status of a cancelled order');
      return;
    }

    if (order.status === 'pending' && status === 'cancelled') {
      setProducts(prevProducts =>
        prevProducts.map(product => {
          const relevantItems = order.items.filter(i => i.productId === product.id);
          if (relevantItems.length === 0) return product;

          let updatedProduct = { ...product };
          const hasOptions = updatedProduct.optionGroup && updatedProduct.optionGroup.options.length > 0;

          if (hasOptions) {
            // Restore ONLY to options if they exist
            updatedProduct.optionGroup = {
              ...updatedProduct.optionGroup!,
              options: updatedProduct.optionGroup!.options.map(opt => {
                const itemForThisOption = relevantItems.filter(i => i.selectedOptionId === opt.id);
                const totalQty = itemForThisOption.reduce((sum, i) => sum + i.quantity, 0);
                return totalQty > 0 ? { ...opt, stock: opt.stock + totalQty } : opt;
              })
            };
            // Sync main stock
            updatedProduct.stock = updatedProduct.optionGroup.options.reduce((sum, o) => sum + o.stock, 0);
          } else {
            // Standard product
            const totalQty = relevantItems.reduce((sum, i) => sum + i.quantity, 0);
            updatedProduct.stock = updatedProduct.stock + totalQty;
          }

          return updatedProduct;
        })
      );
    }

    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
  };

  /* ============================
   * SAMPLE DATA (OPTIONAL)
   * ============================ */
  const loadSampleData = () => {
    if (products.length > 0) return;

    const now = new Date().toISOString();

    const sampleProducts: Product[] = [
      {
        id: generateId('PRD'),
        name: 'Sample Product',
        price: 50,
        stock: 20,
        lowStockThreshold: 5,
        sku: generateId('SKU'),
        status: 'active',
        lastUpdated: now
      }
    ];

    setProducts(sampleProducts);
  };

  // ✅ Order Mode Control Functions
  const startOrderMode = (customerName: string) => {
    setOrderCustomerName(customerName);
    setIsOrderMode(true);
    // Clear legacy localStorage for backwards compatibility
    localStorage.removeItem('pendingOrderCustomer');
  };

  const stopOrderMode = () => {
    setOrderCustomerName(null);
    setIsOrderMode(false);
    // Clear legacy localStorage
    localStorage.removeItem('pendingOrderCustomer');
  };

  return (
    <InventoryContext.Provider value={{ // ✅ Returned Provider
      products,
      orders,
      addProduct,
      updateProduct,
      deleteProducts,
      createOrder,
      updateOrder,
      updateOrderStatus,
      loadSampleData,
      // ✅ Order Mode
      isOrderMode,
      orderCustomerName,
      startOrderMode,
      stopOrderMode
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => { // ✅ Consumer hook
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
