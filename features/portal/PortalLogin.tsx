import React, { useState } from 'react';
import { usePortal } from './PortalContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Building, ArrowRight } from 'lucide-react';

export const PortalLogin: React.FC = () => {
    const { currentUser, login, businessId } = usePortal();
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;
        login(phone);
        navigate(`/portal/${businessId}/dashboard`);
    };

    const businessName = currentUser?.organizationName || currentUser?.name || 'Store';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Building className="h-8 w-8 text-primary" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-gray-900 mb-2">{businessName}</h1>
                    <p className="text-gray-500 text-sm">Customer Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                            Enter your phone number
                        </label>
                        <input
                            type="tel"
                            placeholder="e.g. +1234567890"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Use the phone number associated with your orders.
                        </p>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-primary/20">
                        View My Orders <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
            </div>

            <div className="mt-8 text-center text-gray-400 text-xs font-medium">
                Powered by <span className="text-gray-600 font-bold">Orderly</span>
            </div>
        </div>
    );
};
