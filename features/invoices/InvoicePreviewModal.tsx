import React, { useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { X, FileSpreadsheet, FileText, Send, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { useInvoiceSettings } from '../../hooks/useInvoiceSettings';
import { formatCurrency, cn } from '../../lib/utils';
import type { Order, Product } from '../../types';
import { calculateInvoiceSummary } from '../../lib/taxCalculations';

interface InvoicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
    products: Product[];
    periodLabel: string;
    onExportExcel: () => void;
    onExportPDF: () => void;
    onSendWhatsApp: () => void;
    isPro: boolean;
    isExporting: boolean;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
    isOpen,
    onClose,
    orders,
    products,
    periodLabel,
    onExportExcel,
    onExportPDF,
    onSendWhatsApp,
    isPro,
    isExporting
}) => {
    const { user } = useAuth();
    const { organization } = useOrganization();
    const { settings } = useInvoiceSettings();
    const currency = organization.currency || 'USD';

    // Calculate Totals & Tax
    const { subtotal, taxAmount, grandTotal, cancelledTotal, discount, taxBreakdown } = useMemo(() => {
        const activeOrders = orders.filter(o => o.status !== 'cancelled');
        const cancelledOrders = orders.filter(o => o.status === 'cancelled');

        const summary = calculateInvoiceSummary(activeOrders);
        const cancelledSum = cancelledOrders.reduce((sum, o) => sum + o.total, 0);

        return { ...summary, cancelledTotal: cancelledSum };
    }, [orders]);

    const dueDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + (settings.dueDateDays || 14));
        return d.toLocaleDateString();
    }, [settings.dueDateDays]);

    if (!isOpen) return null;

    // derived values
    const businessName = settings.companyName || organization.name || "Business Name";
    const phone = settings.phone || organization.phoneNumber;
    const primaryColor = settings.primaryColor || '#2563eb';

    // Determine "Bill To" Customer (Single vs Multi)
    const uniqueCustomers = Array.from(new Set(orders.map(o => o.customerName)));
    const isSingleCustomer = uniqueCustomers.length === 1;
    const billToName = isSingleCustomer ? uniqueCustomers[0] : 'Multiple Customers';
    const billToPhone = isSingleCustomer && orders[0].whatsappNumber ? orders[0].whatsappNumber : null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Invoice Preview</h2>
                        <p className="text-gray-500 text-sm font-medium">Review layout before exporting.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                {/* INVOICE CONTENT (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
                    <div className="bg-white shadow-xl overflow-hidden border border-gray-100 min-h-[800px] flex flex-col relative mx-auto max-w-[800px]" style={{ fontFamily: 'Inter, sans-serif' }}>

                        {/* COLOR BAND */}
                        <div className="h-4 w-full" style={{ backgroundColor: primaryColor }}></div>

                        {/* INVOICE HEADER */}
                        <div className="p-8 md:p-12 pb-6 flex flex-col md:flex-row justify-between gap-8">
                            <div className="flex-1">
                                {settings.logoUrl && (
                                    <div className="mb-6">
                                        <img src={settings.logoUrl} alt="Logo" className="h-20 object-contain max-w-[200px]" />
                                    </div>
                                )}
                                <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>

                                <div className="mt-3 text-xs text-gray-500 font-medium space-y-1 leading-relaxed">
                                    {settings.address && <p className="whitespace-pre-wrap max-w-xs">{settings.address}</p>}
                                    {phone && <p>Tel: {phone}</p>}
                                    {settings.email && <p>Email: {settings.email}</p>}
                                    {settings.taxId && <p>Tax ID: {settings.taxId}</p>}
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end">
                                <h2 className="text-4xl font-black uppercase tracking-widest" style={{ color: primaryColor }}>
                                    {settings.invoiceTitle || "INVOICE"}
                                </h2>

                                <div className="mt-6 space-y-2 text-right">
                                    <div className="flex items-center justify-end gap-3 text-sm">
                                        <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Date</span>
                                        <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-3 text-sm">
                                        <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Due Date</span>
                                        <span className="font-bold text-gray-900">{dueDate}</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-3 text-sm bg-gray-50 px-2 py-1 rounded">
                                        <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Period</span>
                                        <span className="font-bold text-gray-900">{periodLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BILL TO */}
                        <div className="px-8 md:px-12 py-4 border-t border-b border-gray-50 bg-gray-50/30 flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Bill To:</span>
                                <p className="text-lg font-bold text-gray-900">{billToName}</p>
                                {billToPhone && <p className="text-sm text-gray-500 mt-1">{billToPhone}</p>}
                                {!isSingleCustomer && <p className="text-xs text-gray-400 mt-1 italic"> Consolidated invoice for {orders.length} orders</p>}
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="p-8 md:p-12 pt-8 flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 text-[10px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
                                        <th className="py-3 pl-4 rounded-l">Date</th>
                                        <th className="py-3">Order #</th>
                                        <th className="py-3 text-center">Items</th>
                                        <th className="py-3 text-right">Subtotal</th>
                                        {taxAmount > 0 && <th className="py-3 text-right">Tax</th>}
                                        <th className="py-3 pr-4 text-right rounded-r">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order, idx) => {
                                        if (order.status === 'cancelled') return null;
                                        return (
                                            <tr key={`${order.id}-${idx}`} className="group">
                                                <td className="py-4 pl-4 text-sm font-bold text-gray-800 align-top">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 text-xs text-gray-500 align-top">
                                                    #{order.id.slice(0, 8)}
                                                </td>
                                                <td className="py-4 text-sm font-medium text-center align-top">
                                                    {order.items.length}
                                                </td>
                                                <td className="py-4 text-sm font-medium text-gray-600 text-right align-top">
                                                    {formatCurrency(order.subtotal || order.total, currency)}
                                                </td>
                                                {taxAmount > 0 && (
                                                    <td className="py-4 text-sm font-medium text-gray-600 text-right align-top">
                                                        {formatCurrency(order.taxAmount || 0, currency)}
                                                        <div className="text-[9px] text-gray-400">
                                                            {order.taxSnapshots && order.taxSnapshots.length > 0
                                                                ? order.taxSnapshots.map(t => `${t.name} (${t.rate}%)`).join(', ')
                                                                : (order as any).taxName
                                                            }
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="py-4 pr-4 text-sm font-bold text-gray-900 text-right align-top">
                                                    {formatCurrency(order.total, currency)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* FOOTER TOTALS */}
                        <div className="px-8 md:px-12 pb-12 break-inside-avoid">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                                {/* Left Side: Terms & Sig */}
                                <div className="flex-1 w-full max-w-sm">
                                    {settings.termsText && (
                                        <div className="mb-8">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</p>
                                            <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap border-l-2 border-gray-100 pl-3">
                                                {settings.termsText}
                                            </p>
                                        </div>
                                    )}
                                    {settings.signatureUrl && (
                                        <div>
                                            <img src={settings.signatureUrl} alt="Signed" className="h-16 object-contain opacity-90" />
                                            <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-200 pt-2 w-32">Authorized Signatory</div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Math */}
                                <div className="w-full md:w-64">
                                    <div className="space-y-3 pb-4 border-b border-gray-100">
                                        <div className="flex justify-between text-sm font-medium text-gray-600">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(subtotal, currency)}</span>
                                        </div>

                                        {/* Tax Breakdown */}
                                        {taxBreakdown ? (
                                            Object.entries(taxBreakdown).forEach(([name, amount]) => (
                                                <div key={name} className="flex justify-between text-sm font-medium text-gray-600">
                                                    <span>{name}</span>
                                                    <span>{formatCurrency(amount as number, currency)}</span>
                                                </div>
                                            ))
                                        ) : (taxAmount > 0 && (
                                            <div className="flex justify-between text-sm font-medium text-gray-600">
                                                <span>Tax Total</span>
                                                <span>{formatCurrency(taxAmount, currency)}</span>
                                            </div>
                                        ))}

                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm font-medium text-gray-600">
                                                <span>Discount</span>
                                                <span>-{formatCurrency(discount, currency)}</span>
                                            </div>
                                        )}
                                        {cancelledTotal > 0 && (
                                            <div className="flex justify-between text-xs text-gray-400 italic">
                                                <span>Cancelled Items</span>
                                                <span className="line-through">{formatCurrency(cancelledTotal, currency)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 flex justify-between items-center bg-gray-50 -mx-4 px-4 py-3 rounded-lg mt-2">
                                        <span className="text-sm font-black uppercase text-gray-500 tracking-widest">Total</span>
                                        <span className="text-2xl font-black" style={{ color: primaryColor }}>
                                            {formatCurrency(grandTotal, currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {(settings.footerNote) && (
                                <div className="mt-12 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-6">
                                    {settings.footerNote}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="bg-white dark:bg-gray-900 p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
                    <Button variant="outline" onClick={onClose} disabled={isExporting}>
                        Close
                    </Button>

                    <div className="flex items-center gap-3">
                        {/* WhatsApp */}
                        <Button
                            onClick={onSendWhatsApp}
                            disabled={isExporting}
                            className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-none"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            WhatsApp
                        </Button>

                        <div className="h-6 w-px bg-gray-200 mx-1"></div>

                        {/* PDF */}
                        <div className="relative group">
                            <Button
                                onClick={onExportPDF}
                                disabled={!isPro || isExporting}
                                className={!isPro ? "opacity-50 cursor-not-allowed" : ""}
                                variant="secondary"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                {isExporting ? 'Generating...' : 'PDF'}
                            </Button>
                            {!isPro && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                                    Upgrade for PDF
                                </div>
                            )}
                        </div>

                        {/* Excel */}
                        <Button
                            onClick={onExportExcel}
                            disabled={isExporting}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Excel
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};
