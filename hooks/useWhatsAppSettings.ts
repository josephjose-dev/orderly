import { useState, useEffect } from 'react';
import { WhatsAppSettings } from '../types';

const STORAGE_KEY = 'whatsapp_settings';
const MAX_DAILY_LIMIT = 50;

const DEFAULT_SETTINGS: WhatsAppSettings = {
    enabled: true,
    sendOnCreate: true,
    sendOnComplete: true,

    templateCreate: "Hi {{customerName}}, your order #{{orderId}} is confirmed! Total: {{total}}. We'll notify you when it's ready.",
    templateComplete: "Good news {{customerName}}! Your order #{{orderId}} is ready for pickup at {{businessName}}.",
    templateInvoice: "Hi {{customerName}}, thanks for your business! Here is invoice #{{invoiceNumber}} for {{total}}. Link: {{link}}",

    dailyCount: 0,
    lastResetDate: new Date().toISOString().split('T')[0]
};

export const useWhatsAppSettings = () => {
    const [settings, setSettings] = useState<WhatsAppSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    // Load Settings & Handle Daily Reset
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const currentSettings = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;

            // Check Daily Reset
            const today = new Date().toISOString().split('T')[0];
            if (currentSettings.lastResetDate !== today) {
                currentSettings.dailyCount = 0;
                currentSettings.lastResetDate = today;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
            }

            setSettings(currentSettings);
        } catch (e) {
            console.error("Failed to load WhatsApp settings", e);
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = (updates: Partial<WhatsAppSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    };

    const incrementCount = () => {
        if (settings.dailyCount >= MAX_DAILY_LIMIT) return false;

        const newCount = settings.dailyCount + 1;
        updateSettings({ dailyCount: newCount });
        return true;
    };

    const resetDefaults = () => {
        updateSettings({
            ...DEFAULT_SETTINGS,
            dailyCount: settings.dailyCount, // Preserve stats
            lastResetDate: settings.lastResetDate
        });
    };

    return {
        settings,
        loading,
        updateSettings,
        incrementCount,
        resetDefaults,
        isLimitReached: settings.dailyCount >= MAX_DAILY_LIMIT,
        limit: MAX_DAILY_LIMIT
    };
};
