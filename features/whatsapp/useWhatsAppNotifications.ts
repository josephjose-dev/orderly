import { useCallback } from 'react';
import { useWhatsAppSettings } from '../../hooks/useWhatsAppSettings';
import { useAuth } from '../../hooks/useAuth';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils'; // Keep helper if needed or reimplement simple format

interface SendParams {
    phone?: string;
    message: string;
}

export const useWhatsAppNotifications = () => {
    const { settings, incrementCount, isLimitReached } = useWhatsAppSettings();
    const { user } = useAuth();

    const openWhatsApp = useCallback(({ phone, message }: SendParams) => {
        if (!phone) {
            alert("No phone number provided.");
            return false;
        }

        if (isLimitReached) {
            alert(`Daily WhatsApp limit reached (${settings.dailyCount}/50).`);
            return false;
        }

        // Clean phone
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const encoded = encodeURIComponent(message);
        const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

        window.open(url, '_blank');
        incrementCount();
        return true;
    }, [isLimitReached, settings.dailyCount, incrementCount]);

    const parseTemplate = (template: string, data: Record<string, string>) => {
        let msg = template;
        Object.entries(data).forEach(([key, val]) => {
            msg = msg.replace(new RegExp(`{{${key}}}`, 'g'), val);
        });
        return msg;
    };

    const sendOrderConfirmation = useCallback((order: Order) => {
        if (!settings.enabled || !settings.sendOnCreate) return;

        const businessName = user?.organizationName || "Business";
        const currency = user?.currency || 'USD'; // Simplified access

        const message = parseTemplate(settings.templateCreate, {
            customerName: order.customerName,
            orderId: order.id.slice(0, 8),
            total: `${currency} ${order.total.toFixed(2)}`,
            businessName,
            itemsCount: order.items.length.toString()
        });

        return openWhatsApp({ phone: order.whatsappNumber, message });
    }, [settings, user, openWhatsApp]);

    const sendOrderReady = useCallback((order: Order) => {
        if (!settings.enabled || !settings.sendOnComplete) return;

        const businessName = user?.organizationName || "Business";

        const message = parseTemplate(settings.templateComplete, {
            customerName: order.customerName,
            orderId: order.id.slice(0, 8),
            businessName,
        });

        return openWhatsApp({ phone: order.whatsappNumber, message });
    }, [settings, user, openWhatsApp]);

    // Legacy Support / Invoice Specific
    const sendInvoice = useCallback((order: Order, link: string = '') => {
        // Explicit trigger, ignores "enabled" flag typically? No, enforce compliance.
        // Actually for Invoice manually sent, we might want to bypass "sendOnCreate" etc flags, 
        // but check global enabled + limit.

        if (!settings.enabled) return;

        const businessName = user?.organizationName || "Business";
        const currency = user?.currency || 'USD';

        const message = parseTemplate(settings.templateInvoice, {
            customerName: order.customerName,
            invoiceNumber: `INV-${order.id.slice(0, 8)}`,
            total: `${currency} ${order.total.toFixed(2)}`,
            businessName,
            link: link || '(Attached)'
        });

        return openWhatsApp({ phone: order.whatsappNumber, message });
    }, [settings, user, openWhatsApp]);

    return {
        sendOrderConfirmation,
        sendOrderReady,
        sendInvoice,
        isLimitReached,
        dailyCount: settings.dailyCount
    };
};
