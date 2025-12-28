import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { Order, InvoiceRecord } from '../../types';

export function useInvoices() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Storage key: invoices:<orgId>
    const storageKey = user ? `invoices:${user.organizationId}` : '';

    useEffect(() => {
        if (!storageKey) {
            setInvoices([]);
            setLoading(false);
            return;
        }

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                setInvoices(JSON.parse(stored));
            } else {
                setInvoices([]);
            }
        } catch (e) {
            console.error("Failed to load invoices:", e);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    }, [storageKey]);

    const saveInvoices = (newInvoices: InvoiceRecord[]) => {
        setInvoices(newInvoices);
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(newInvoices));
        }
    };

    const addInvoice = (invoice: InvoiceRecord) => {
        const updated = [invoice, ...invoices];
        saveInvoices(updated);
    };

    const deleteInvoice = (id: string) => {
        const updated = invoices.filter(inv => inv.id !== id);
        saveInvoices(updated);
    };

    const getMonthlyInvoiceCount = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return invoices.filter(inv => {
            const d = new Date(inv.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;
    };

    return {
        invoices,
        loading,
        addInvoice,
        deleteInvoice,
        getMonthlyInvoiceCount
    };
}
