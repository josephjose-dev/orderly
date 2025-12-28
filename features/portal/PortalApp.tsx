import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { PortalLogin } from './PortalLogin';
import { PortalDashboard } from './PortalDashboard';
import { PortalLayout } from './PortalLayout';
import { PortalProvider } from './PortalContext';

export const PortalApp: React.FC = () => {
    // businessId from URL
    const { businessId } = useParams<{ businessId: string }>();

    if (!businessId) {
        return <div className="p-10 text-center">Invalid Portal Link</div>;
    }

    return (
        <PortalProvider businessId={businessId}>
            <Routes>
                <Route path="/" element={<PortalLogin />} />
                <Route path="/dashboard" element={
                    <PortalLayout>
                        <PortalDashboard />
                    </PortalLayout>
                } />
            </Routes>
        </PortalProvider>
    );
};
