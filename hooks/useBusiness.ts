import { useState, useEffect, useCallback } from 'react';
import { Business, BusinessType, SubscriptionPlan, BusinessRegion } from '../types';
import { useAuth } from './useAuth';

// Constants
const STORAGE_KEY_BUSINESS_PREFIX = 'orderly_business_';

// Default Config
const DEFAULT_CONFIG = {
    country: 'US',
    timezone: 'UTC',
    language: 'en',
    functionalCurrency: 'USD',
    displayCurrency: 'USD',
    multiCurrencyEnabled: false,
    taxSystem: 'None' as const,
    taxRate: 0,
    pricesIncludeTax: false,
    inventoryTracking: true,
    lowStockThreshold: 5,
    orderSources: ['WhatsApp', 'Manual']
};

export const useBusiness = () => {
    const { user, updateUser } = useAuth();
    const [business, setBusiness] = useState<Business | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load business on mount or when user changes
    useEffect(() => {
        if (!user?.businessId) {
            setBusiness(null);
            setIsLoading(false);
            return;
        }

        const stored = localStorage.getItem(`${STORAGE_KEY_BUSINESS_PREFIX}${user.businessId}`);
        if (stored) {
            try {
                setBusiness(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse business data", e);
            }
        }
        setIsLoading(false);
    }, [user?.businessId]);

    const createBusiness = useCallback(async (
        name: string,
        type: BusinessType,
        country: string,
        currency: string,
        plan: SubscriptionPlan = 'free'
    ) => {
        if (!user) throw new Error("User must be logged in to create a business");

        const newBusinessId = `biz_${Math.random().toString(36).substr(2, 9)}`;

        const newBusiness: Business = {
            id: newBusinessId,
            name,
            type,
            country,
            currency,
            plan,
            ownerId: user.id,
            createdAt: new Date().toISOString(),
            config: {
                ...DEFAULT_CONFIG,
                country,
                functionalCurrency: currency,
                displayCurrency: currency
            }
        };

        // Persist Business
        localStorage.setItem(`${STORAGE_KEY_BUSINESS_PREFIX}${newBusinessId}`, JSON.stringify(newBusiness));

        // Update User
        updateUser({
            businessId: newBusinessId,
            role: 'admin', // Creator is always admin
            // Sync legacy fields for compatibility
            organizationId: newBusinessId,
            organizationName: name,
            currency: currency
        });

        setBusiness(newBusiness);
        return newBusiness;
    }, [user, updateUser]);

    const updateBusinessPlan = useCallback((newPlan: SubscriptionPlan) => {
        if (!business) return;
        const updated = { ...business, plan: newPlan };
        setBusiness(updated);
        localStorage.setItem(`${STORAGE_KEY_BUSINESS_PREFIX}${business.id}`, JSON.stringify(updated));
    }, [business]);

    return {
        business,
        isLoading,
        createBusiness,
        updateBusinessPlan,
        hasBusiness: !!business
    };
};
