import React from 'react';
import { usePortal } from './PortalContext';
import { Button } from '../../components/ui/Button';
import { LogOut, RefreshCw } from 'lucide-react';

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, businessId } = usePortal();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="font-black text-lg">My Orders</h1>
                    <Button variant="ghost" size="sm" onClick={logout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>
            <main className="flex-1 max-w-md mx-auto w-full p-4">
                {children}
            </main>
        </div>
    );
};
