import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { InvoiceSettings } from '../types';

const DEFAULT_SETTINGS: InvoiceSettings = {
    companyName: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    logoUrl: '',
    signatureUrl: '',
    logoPosition: 'right',
    invoiceTitle: 'INVOICE',
    footerNote: 'Thank you for your business!',
    termsText: '',
    showOrderIds: true,
    showCustomerName: true,
    showNotes: true,
    dateFormat: 'YYYY-MM-DD',
    primaryColor: '#2563eb', // Default Blue
    taxRate: 0,
    dueDateDays: 14,
};

export { type InvoiceSettings };

export function useInvoiceSettings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<InvoiceSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    const STORAGE_KEY = `orderly_invoice_settings_${user?.organizationId || 'default'}`;

    useEffect(() => {
        if (!user?.organizationId) return;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                // Determine layout or migrate old settings if needed
                const parsed = JSON.parse(stored);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (e) {
            console.error("Failed to load invoice settings", e);
        } finally {
            setLoading(false);
        }
    }, [user?.organizationId, STORAGE_KEY]);

    const updateSettings = (newSettings: Partial<InvoiceSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    };

    return {
        settings,
        loading,
        updateSettings,
        resetSettings
    };
}
