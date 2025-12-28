import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings } from 'lucide-react';
import { InvoiceSettingsModal } from '../settings/InvoiceSettings';
import { Button } from '../../components/ui/Button';

export const InvoiceSettingsToggle: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (user?.role !== 'admin') return null;

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Invoice Settings
            </Button>

            <InvoiceSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};
