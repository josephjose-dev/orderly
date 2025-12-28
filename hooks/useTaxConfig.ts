import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { TaxConfig, TaxLine } from '../types';

const DEFAULT_TAX_CONFIG: TaxConfig = {
    taxes: [],
    updatedAt: new Date().toISOString()
};

export function useTaxConfig() {
    const { user } = useAuth();
    const [taxConfig, setTaxConfig] = useState<TaxConfig>(DEFAULT_TAX_CONFIG);
    const [loading, setLoading] = useState(true);

    // Key per organization
    const STORAGE_KEY = `orderly_tax_config_${user?.organizationId || 'default'}`;

    useEffect(() => {
        if (!user?.organizationId) return;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);

                // MIGRATION: Check if legacy format (has 'rate' but no 'taxes')
                if (!parsed.taxes && 'rate' in parsed) {
                    const legacyTaxes: TaxLine[] = [];
                    if (parsed.enabled) {
                        legacyTaxes.push({
                            id: crypto.randomUUID(),
                            name: parsed.name || 'Tax',
                            rate: parsed.rate || 0,
                            mode: parsed.mode || 'fixed',
                            enabled: true
                        });
                    }
                    setTaxConfig({
                        taxes: legacyTaxes,
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    setTaxConfig({ ...DEFAULT_TAX_CONFIG, ...parsed });
                }
            }
        } catch (e) {
            console.error("Failed to load tax config", e);
        } finally {
            setLoading(false);
        }
    }, [user?.organizationId, STORAGE_KEY]);

    const saveConfig = (newConfig: TaxConfig) => {
        setTaxConfig(newConfig);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    };

    const addTax = (tax: Omit<TaxLine, 'id'>) => {
        const newTax: TaxLine = { ...tax, id: crypto.randomUUID() };
        saveConfig({
            ...taxConfig,
            taxes: [...taxConfig.taxes, newTax],
            updatedAt: new Date().toISOString()
        });
    };

    const updateTax = (id: string, updates: Partial<TaxLine>) => {
        const newTaxes = taxConfig.taxes.map(t =>
            t.id === id ? { ...t, ...updates } : t
        );
        saveConfig({ ...taxConfig, taxes: newTaxes, updatedAt: new Date().toISOString() });
    };

    const deleteTax = (id: string) => {
        const newTaxes = taxConfig.taxes.filter(t => t.id !== id);
        saveConfig({ ...taxConfig, taxes: newTaxes, updatedAt: new Date().toISOString() });
    };

    return {
        taxConfig,
        loading,
        addTax,
        updateTax,
        deleteTax
    };
}
