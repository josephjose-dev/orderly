import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useInventory } from '../../hooks/useInventory';
import { useInvoiceExporter } from '../../features/invoices/useInvoiceExporter';
import { NewInvoiceModal } from '../../features/invoices/NewInvoiceModal';
import { calculateOrderTotals } from '../../lib/taxCalculations';
import { useTaxConfig } from '../../hooks/useTaxConfig';
import { InvoicePreviewModal } from '../../features/invoices/InvoicePreviewModal';
import { useWhatsAppNotifications } from '../../features/whatsapp/useWhatsAppNotifications';
import { formatCurrency, getStatusColor, cn, isSameLocalDay } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import {
  Download,
  MessageCircle,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';
import { InputModal } from '../../components/ui/InputModal';

type ActiveTab = 'orders' | 'invoices';

const InvoicePlaceholderPanel: React.FC<{ onOpenModal: () => void, isPro: boolean, betaLimitReached: boolean, monthlyCount: number, limit: number }> = ({
  onOpenModal, isPro, betaLimitReached, monthlyCount, limit
}) => {
  return (
    <div className="bg-white p-12 text-center rounded-3xl border shadow-sm flex flex-col items-center gap-6 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
      <div className="bg-primary/10 p-5 rounded-full ring-8 ring-primary/5">
        <FileText className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h3 className="text-3xl font-black tracking-tight text-gray-900">Invoices</h3>
        <p className="text-gray-500 font-medium mt-2 max-w-md mx-auto">
          Generate professional PDF and Excel invoices for your customers.
        </p>
      </div>

      <Button onClick={onOpenModal} size="lg" className="rounded-2xl px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
        <Plus className="h-5 w-5 mr-2" />
        Create New Invoice
      </Button>

      <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-gray-100 mt-2">
        {isPro ? (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Pro Plan: Unlimited PDF & Excel
          </span>
        ) : (
          <span className={cn(betaLimitReached ? "text-red-500" : "text-gray-500")}>
            {monthlyCount} / {limit} Monthly Exports Used
          </span>
        )}
      </div>
    </div>
  );
};


export const OrderManager: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const {
    products,
    orders,
    updateOrderStatus,
    updateOrder,
    loadSampleData,
    startOrderMode
  } = useInventory();

  // Invoice Hooks
  const { isExporting, canExport, monthlyCount, limit, exportInvoiceExcel, exportInvoicePDF, isPro } = useInvoiceExporter();

  const currency = user?.currency || 'USD';

  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');

  /** FILTERING STATE */
  type OrderDateFilter =
    | { type: 'today' }
    | { type: 'yesterday' }
    | { type: 'last30' }
    | { type: 'range'; from: string; to: string };
  const [dateFilter, setDateFilter] = useState<OrderDateFilter>({ type: 'today' });
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const { taxConfig } = useTaxConfig(); // Use tax config for edits if needed

  /** MANUAL ORDER MODAL STATE */
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);

  /* INVOICE STATE */
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewParams, setPreviewParams] = useState<any>(null);

  /** ORDER CANCELLATION STATE */
  const [orderToCancel, setOrderToCancel] = useState<any | null>(null);

  useEffect(() => {
    const intent = localStorage.getItem('order_filter_day');
    if (intent === 'today') {
      setDateFilter({ type: 'today' });
      localStorage.removeItem('order_filter_day');
    }
  }, []);

  const filteredOrders = useMemo(() => {
    const today = new Date();
    if (dateFilter.type === 'today') {
      return orders.filter(order => isSameLocalDay(order.createdAt, today));
    }
    if (dateFilter.type === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return orders.filter(order => isSameLocalDay(order.createdAt, yesterday));
    }
    if (dateFilter.type === 'last30') {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return orders.filter(order => new Date(order.createdAt) >= start);
    }
    if (dateFilter.type === 'range') {
      const from = new Date(dateFilter.from);
      const to = new Date(dateFilter.to);
      // set to end of day
      to.setHours(23, 59, 59, 999);
      return orders.filter(order => {
        const created = new Date(order.createdAt);
        return created >= from && created <= to;
      });
    }
    return [];
  }, [orders, dateFilter]);

  const getFilterLabel = () => {
    switch (dateFilter.type) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last30':
        return 'Last 30 Days';
      case 'range':
        return `${dateFilter.from} → ${dateFilter.to}`;
      default:
        return '';
    }
  };

  const { sendOrderReady, sendInvoice } = useWhatsAppNotifications();

  const handleManualOrder = () => {
    setIsManualOrderModalOpen(true);
  };

  const onManualOrderSubmit = (values: Record<string, string>) => {
    const customerName = values.customerName;
    if (!customerName?.trim()) return;
    startOrderMode(customerName.trim()); // ✅ Use centralized order mode
    setIsManualOrderModalOpen(false);
    onNavigate?.('products');
  };

  const onCancelConfirm = () => {
    if (orderToCancel) {
      updateOrderStatus(orderToCancel.id, 'cancelled');
      setOrderToCancel(null);
    }
  };

  const startEdit = (order: any) => {
    setIsEditing(true);
    setEditedItems(order.items.map((i: any) => ({ ...i })));
  };

  const saveEdit = () => {
    if (!selectedOrder) return;

    // Recalculate totals using global Tax Config
    // This applies current tax rules to the edited order
    const totals = calculateOrderTotals(
      editedItems,
      taxConfig,
      undefined,
      (selectedOrder as any).discount || 0
    );

    const result = updateOrder(selectedOrder.id, {
      items: editedItems,
      ...totals
    });
    if (!result.success) {
      alert(result.message);
      return;
    }

    setIsEditing(false);
    setSelectedOrder(null);
  };

  // Removed old handleExportCSV as it is replaced by the new Invoice System

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black mb-2">Manage Orders</h1>
          <div className="flex items-center gap-2 border-b">
            <button onClick={() => setActiveTab('orders')} className={cn("px-4 py-2 text-sm font-black transition-all border-b-2", activeTab === 'orders' ? "text-primary border-primary" : "text-gray-400 border-transparent hover:text-gray-700")}>
              Orders
            </button>
            <button onClick={() => setActiveTab('invoices')} className={cn("px-4 py-2 text-sm font-black transition-all border-b-2", activeTab === 'invoices' ? "text-primary border-primary" : "text-gray-400 border-transparent hover:text-gray-700")}>
              Invoices
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button onClick={handleManualOrder}>
            <MessageCircle className="h-4 w-4 mr-2" />
            New Manual Order
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {/* Date Selector Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
          {/* ... Date filter buttons ... */}
          <button
            onClick={() => setDateFilter({ type: 'today' })}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              dateFilter.type === 'today' ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter({ type: 'yesterday' })}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              dateFilter.type === 'yesterday' ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Yesterday
          </button>
          <button
            onClick={() => setDateFilter({ type: 'last30' })}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              dateFilter.type === 'last30' ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Last 30 Days
          </button>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all",
            dateFilter.type === 'range' ? "bg-white shadow-sm" : ""
          )}>
            <Calendar className={cn("h-3 w-3", dateFilter.type === 'range' ? "text-primary" : "text-gray-400")} />
            <input
              type="date"
              className="bg-transparent border-0 p-0 text-xs font-black focus:ring-0 cursor-pointer"
              placeholder="From"
              value={customFrom}
              onChange={e => { setCustomFrom(e.target.value); if (customTo) setDateFilter({ type: 'range', from: e.target.value, to: customTo }); }}
            />
            <span className="mx-1">→</span>
            <input
              type="date"
              className="bg-transparent border-0 p-0 text-xs font-black focus:ring-0 cursor-pointer"
              placeholder="To"
              value={customTo}
              onChange={e => { setCustomTo(e.target.value); if (customFrom) setDateFilter({ type: 'range', from: customFrom, to: e.target.value }); }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
        Showing orders for: <span className="text-primary">{getFilterLabel()}</span>
      </p>

      {
        activeTab === 'orders' && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-3xl border shadow-sm">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-200" />
                <h3 className="text-xl font-black mt-4">No orders for {getFilterLabel()}</h3>
                <p className="text-xs text-gray-400 mt-2 font-medium">Clear filters or browse another day</p>
                {dateFilter.type === 'today' && orders.length === 0 && (
                  <Button onClick={loadSampleData} className="mt-6">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Load Sample Orders
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl overflow-hidden border shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer / ID</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-black text-sm">{order.customerName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{order.id}</p>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {order.items.map((i, idx) => {
                              const exists = products.find(p => p.id === i.productId);
                              const name = exists ? i.productName : 'Deleted product';
                              return (
                                <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 border border-gray-200/50">
                                  {name}{i.selectedOptionLabel ? ` (${i.selectedOptionLabel})` : ''} × {i.quantity}
                                </span>
                              );
                            })}
                          </div>
                          {order.note && (
                            <p className="mt-1 text-sm text-gray-500 italic">Note: {order.note}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 font-black">
                          {formatCurrency(order.total, currency)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm',
                            getStatusColor(order.status)
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {order.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  updateOrderStatus(order.id, 'completed');
                                  // Trigger WhatsApp Pickup Notification
                                  const confirmed = window.confirm("Order Completed. Send WhatsApp notification?");
                                  if (confirmed && sendOrderReady) {
                                    sendOrderReady(order);
                                  }
                                }}
                                className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setOrderToCancel(order); }}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )
      }

      {
        activeTab === 'invoices' && (
          <InvoicePlaceholderPanel
            onOpenModal={() => setIsInvoiceModalOpen(true)}
            isPro={isPro}
            betaLimitReached={!canExport}
            monthlyCount={monthlyCount}
            limit={limit}
          />
        )
      }

      {/* MANUAL ORDER MODAL */}
      <InputModal
        isOpen={isManualOrderModalOpen}
        title="New Manual Order"
        fields={[
          { key: 'customerName', label: 'Customer Name', type: 'text', placeholder: 'Enter Name' }
        ]}
        onSubmit={onManualOrderSubmit}
        onCancel={() => setIsManualOrderModalOpen(false)}
      />

      {/* 1. SELECTION MODAL */}
      <NewInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        allOrders={orders}
        isPro={isPro}
        betaLimitReached={!canExport}
        onExport={(params) => {
          // Instead of exporting immediately, open Preview
          setPreviewParams(params);
          setIsInvoiceModalOpen(false);
          setIsPreviewOpen(true);
        }}
      />

      {/* 2. PREVIEW MODAL */}
      {previewParams && (
        <InvoicePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          orders={previewParams.orders}
          products={products}
          periodLabel={previewParams.periodLabel}
          isPro={isPro}
          isExporting={isExporting}
          onExportExcel={() => {
            exportInvoiceExcel({
              orders: previewParams.orders,
              business: { name: user?.organizationName || 'Business', whatsapp: user?.phoneNumber },
              periodLabel: previewParams.periodLabel,
              currency,
              includeCancelled: previewParams.includeCancelled
            });
            setIsPreviewOpen(false);
          }}
          onExportPDF={() => {
            exportInvoicePDF({
              orders: previewParams.orders,
              business: { name: user?.organizationName || 'Business', whatsapp: user?.phoneNumber },
              periodLabel: previewParams.periodLabel,
              currency,
              includeCancelled: previewParams.includeCancelled
            });
            setIsPreviewOpen(false);
          }}
          onSendWhatsApp={() => {
            const mockOrder: any = {
              id: "PREVIEW-1234", // Dummy ID that slices safely
              customerName: previewParams.orders.length === 1 ? previewParams.orders[0].customerName : 'Valued Customer',
              whatsappNumber: previewParams.orders.length === 1 ? previewParams.orders[0].whatsappNumber : '',
              total: previewParams.orders.reduce((sum: number, o: any) => sum + (o.status !== 'cancelled' ? o.total : 0), 0),
              items: []
            };
            const phone = mockOrder.whatsappNumber;
            // First arg is order, second is link (empty for now)
            // But wait, the hook uses order.whatsappNumber preferentially?
            // "openWhatsApp({ phone: order.whatsappNumber... })"
            // So we must ensure whatsappNumber is ON the object.
            sendInvoice(mockOrder, '');
          }}
        />
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      <InputModal
        isOpen={Boolean(orderToCancel)}
        title="Cancel order?"
        description="Cancelling this order will restore stock. This action cannot be undone."
        fields={[]}
        onSubmit={onCancelConfirm}
        onCancel={() => setOrderToCancel(null)}
      />

      {/* ORDER DETAILS MODAL */}
      {
        selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-4">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black">Order Details</h3>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-tighter">{selectedOrder.id} • {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => { setSelectedOrder(null); setIsEditing(false); }}
                  className="bg-gray-100 p-2 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {isEditing && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl mb-6 flex gap-3 text-xs font-bold text-yellow-700">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  Editing this order will update inventory levels. Please ensure the new quantities are accurate.
                </div>
              )}

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 mb-6 scrollbar-hide">
                {(isEditing ? editedItems : selectedOrder.items).map((item, idx) => {
                  const exists = products.find(p => p.id === item.productId);
                  const name = exists ? item.productName : 'Deleted product';

                  return (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-gray-100/50">
                      <div className="flex flex-col">
                        <span className="font-black text-sm">
                          {name}{item.selectedOptionLabel ? ` (${item.selectedOptionLabel})` : ''}
                        </span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                          {formatCurrency(item.price, currency)} each
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-3">
                          <button
                            className="bg-white border p-1 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              const next = [...editedItems];
                              next[idx].quantity = Math.max(1, next[idx].quantity - 1);
                              setEditedItems(next);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="font-black w-4 text-center">{item.quantity}</span>

                          <button
                            className="bg-white border p-1 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              const next = [...editedItems];
                              next[idx].quantity += 1;
                              setEditedItems(next);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>

                          <button
                            className="ml-2 p-1 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => {
                              setEditedItems(editedItems.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-black text-sm bg-white px-3 py-1 rounded-lg shadow-sm border">
                          × {item.quantity}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-6 space-y-3">

                {/* Breakdown */}
                {/* Breakdown */}
                {(() => {
                  const currentTotals = isEditing
                    ? calculateOrderTotals(editedItems, taxConfig, undefined, (selectedOrder as any).discount || 0)
                    : selectedOrder;

                  const subtotal = (currentTotals as any).subtotal || (selectedOrder?.total || 0);
                  const isLegacy = !('taxSnapshots' in currentTotals) && ((currentTotals as any).taxAmount > 0);

                  return (
                    <>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal, currency)}</span>
                      </div>

                      {/* Tax Snapshots */}
                      {(currentTotals as any).taxSnapshots?.map((tax: any) => (
                        <div key={tax.id} className="flex justify-between items-center text-sm text-gray-500">
                          <span>{tax.name} ({tax.rate}%)</span>
                          <span>{formatCurrency(tax.amount, currency)}</span>
                        </div>
                      ))}

                      {/* Legacy Tax Fallback */}
                      {isLegacy && (
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{(currentTotals as any).taxName || 'Tax'} ({(currentTotals as any).taxRate}%)</span>
                          <span>{formatCurrency((currentTotals as any).taxAmount, currency)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-6 pt-3 border-t">
                        <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Total Amount</span>
                        <span className="text-3xl font-black text-primary">
                          {formatCurrency(
                            (currentTotals as any).total !== undefined ? (currentTotals as any).total : selectedOrder!.total,
                            currency
                          )}
                        </span>
                      </div>
                    </>
                  );
                })()}

                <div className="flex gap-3">
                  {!isEditing && selectedOrder.status === 'pending' && (
                    <Button className="flex-1" onClick={() => startEdit(selectedOrder)}>
                      Edit Order
                    </Button>
                  )}

                  {isEditing && (
                    <>
                      <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1" onClick={saveEdit}>
                        Save Changes
                      </Button>
                    </>
                  )}

                  {!isEditing && (
                    <Button variant="outline" className="flex-1" onClick={() => { setSelectedOrder(null); setIsEditing(false); }}>
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};
