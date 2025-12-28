import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import {
    X,
    Calendar,
    FileText,
    FileSpreadsheet, // For Excel
    FileType, // Fallback
    Lock
} from 'lucide-react';
import type { Order } from '../../types';

interface NewInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[]; // These are orders already filtered by date from parent? Or do we filter here?
    // Prompt says "Date range selector... Today, Last 30 Days...".
    // This implies the modal usually controls the filtering OR re-uses parent filtering.
    // BUT, OrderManager already has date filtering. 
    // If I put filtering inside modal, it duplicates logic.
    // HOWEVER, if I use OrderManager's filtered orders, then the modal just confirms "Current Selection" vs "Custom"?
    // Prompt: "UI Controls: Date range selector: Today, Last 30 Days, Custom range...".
    // This suggests the Modal is independent or overrides current view.
    // FOR SIMPLICITY and SPEED: I will accept `orders` (currently viewed) as the default selection, 
    // OR I will ask the user to select the range IN the modal.
    // Given "Placeholders: New Invoice opens real invoice flow...", likely it starts fresh.
    // But passing ALL orders into modal to filter is heavy.
    // I will assume the `OrderManager` passes the *currently filtered* orders and the label, 
    // and maybe the Modal just allows "Include Cancelled" toggling and format selection 
    // on the *current set*.
    // WAIT. Prompt 5 says controls: "Date range selector: Today, Last 30...".
    // So the modal *should* allow changing the range.
    // To do this properly, the modal needs access to ALL orders or a way to request them.
    // `useInventory` provides all orders. I can filter inside the modal.
    allOrders: Order[];
    onExport: (params: {
        orders: Order[],
        periodLabel: string,
        includeCancelled: boolean,
        format: 'excel' | 'pdf'
    }) => void;
    isPro: boolean;
    betaLimitReached: boolean;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({
    isOpen,
    onClose,
    allOrders,
    onExport,
    isPro,
    betaLimitReached
}) => {
    const { user } = useAuth();
    const currency = user?.currency || 'USD';

    // State
    const [rangeType, setRangeType] = useState<'today' | 'last30' | 'custom'>('today');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState(''); // YYYY-MM-DD
    const [includeCancelled, setIncludeCancelled] = useState(false);

    if (!isOpen) return null;

    // Filter Logic
    const getFilteredOrders = () => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let filtered = allOrders;
        let label = '';

        if (rangeType === 'today') {
            filtered = allOrders.filter(o => new Date(o.createdAt) >= startOfDay);
            label = 'Today';
        } else if (rangeType === 'last30') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            filtered = allOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
            label = 'Last 30 Days';
        } else if (rangeType === 'custom') {
            if (!customStart || !customEnd) return { orders: [], label: 'Custom' };
            const start = new Date(customStart);
            const end = new Date(customEnd);
            end.setHours(23, 59, 59, 999); // End of day
            filtered = allOrders.filter(o => {
                const d = new Date(o.createdAt);
                return d >= start && d <= end;
            });
            label = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
        }

        // Cancelled filter
        if (!includeCancelled) {
            filtered = filtered.filter(o => o.status !== 'cancelled');
        }

        return { orders: filtered, label };
    };

    const { orders: selectedOrders, label } = getFilteredOrders();
    const totalAmount = selectedOrders.reduce((sum, o) => sum + o.total, 0);

    const handleContinue = () => {
        onExport({
            orders: selectedOrders,
            periodLabel: label,
            includeCancelled,
            format: 'excel' // Placeholder, format is decided in Preview
        });
        onClose();
    };

    const isActionDisabled = selectedOrders.length === 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-xl font-black dark:text-white">New Invoice</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                            Select Orders & Period
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto">

                    {/* Date Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Date Range</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['today', 'last30', 'custom'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setRangeType(type)}
                                    className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${rangeType === type
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    {type === 'today' ? 'Today' : type === 'last30' ? 'Last 30 Days' : 'Custom'}
                                </button>
                            ))}
                        </div>

                        {rangeType === 'custom' && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">From</span>
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={e => setCustomStart(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">To</span>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={e => setCustomEnd(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Options */}
                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <input
                            type="checkbox"
                            id="inc-cancel"
                            checked={includeCancelled}
                            onChange={(e) => setIncludeCancelled(e.target.checked)}
                            className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="inc-cancel" className="text-sm font-bold text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                            Include Cancelled Orders
                        </label>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Selected Orders</span>
                            <span className="text-lg font-black text-primary">{selectedOrders.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Total Value</span>
                            <span className="text-xl font-black text-gray-900 dark:text-white">
                                {formatCurrency(totalAmount, currency)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
                    <Button
                        onClick={handleContinue}
                        disabled={isActionDisabled}
                        className={`rounded-xl px-8 ${isActionDisabled ? 'opacity-50' : ''}`}
                    >
                        Continue to Preview
                    </Button>
                </div>
            </div>
        </div>
    );
};
