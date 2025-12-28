import React from 'react';
import { usePortal } from './PortalContext';
import { getStatusColor, formatCurrency } from '../../lib/utils';
import { Calendar, Package, ChevronRight, FileText } from 'lucide-react';

export const PortalDashboard: React.FC = () => {
    const { orders, currentUser } = usePortal();
    const currency = currentUser?.currency || 'USD';

    // Sort by date desc
    const sortedOrders = [...orders].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const handleDownloadInvoice = (orderId: string) => {
        // TODO: Reuse export logic. 
        // Since useInvoiceExporter depends on Auth context, we might need a Portal-specific exporter.
        // For Phase 1, we can alert or implement a simpler one.
        alert("Invoice download functionality coming in next update.");
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-gray-900">Your Orders</h2>
                <p className="text-sm text-gray-500 font-medium">
                    {orders.length} orders found
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500 text-sm max-w-[200px] mx-auto">
                        Orders placed with your phone number will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedOrders.map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">

                            {/* Header: Date & Status */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Main Info: Items & Total */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-900 font-bold text-sm">
                                        {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-0.5 max-w-[150px] truncate">
                                        {order.items.map(i => i.productName).join(', ')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900">
                                        {formatCurrency(order.total, currency)}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-50 flex justify-end gap-3">
                                {order.status === 'completed' && (
                                    <button
                                        onClick={() => handleDownloadInvoice(order.id)}
                                        className="text-xs font-bold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
                                    >
                                        <FileText className="h-3 w-3" /> Invoice
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
