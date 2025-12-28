import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Order } from '../../types';

interface PortalContextType {
    businessId: string;
    currentUser: User | null; // The business owner
    customerPhone: string | null;
    orders: Order[];
    login: (phone: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode, businessId: string }> = ({ children, businessId }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [customerPhone, setCustomerPhone] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load "Business Data" (simulated by reading Admin's localStorage)
        // In reality, this would be an API call fetching public business info
        const usersList = JSON.parse(localStorage.getItem('orderly_users_list') || '[]');

        // Find user by Business ID (using ID or trying to match)
        // Since we don't have a real backend mapping businessId -> User, 
        // we'll assume businessId in URL is the User ID for this demo
        const businessOwner = usersList.find((u: User) => u.id === businessId || u.businessId === businessId);

        if (businessOwner) {
            setCurrentUser(businessOwner);
        }
        setIsLoading(false);
    }, [businessId]);

    useEffect(() => {
        if (!currentUser || !customerPhone) {
            setOrders([]);
            return;
        }

        // Load Orders for this business
        const storageKey = `orders:${currentUser.id}`;
        const allOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');

        // Filter by Customer Phone
        const customerOrders = allOrders.filter((o: Order) =>
            (o.whatsappNumber || '').replace(/\D/g, '') === customerPhone.replace(/\D/g, '')
        );

        setOrders(customerOrders);

    }, [currentUser, customerPhone]);

    const login = (phone: string) => {
        setCustomerPhone(phone);
    };

    const logout = () => {
        setCustomerPhone(null);
    };

    return (
        <PortalContext.Provider value={{ businessId, currentUser, customerPhone, orders, login, logout, isLoading }}>
            {children}
        </PortalContext.Provider>
    );
};

export const usePortal = () => {
    const context = useContext(PortalContext);
    if (!context) throw new Error('usePortal must be used within PortalProvider');
    return context;
};
