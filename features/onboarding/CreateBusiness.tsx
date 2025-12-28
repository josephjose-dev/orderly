import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';
import { BusinessType, SubscriptionPlan } from '../../types';

interface FormData {
    name: string;
    type: BusinessType;
    country: string;
    currency: string;
}

export const CreateBusiness: React.FC = () => {
    const { user, logout } = useAuth();
    const { createBusiness } = useBusiness();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default country/currency map (simplified)
    const [formData, setFormData] = useState<FormData>({
        name: user?.organizationName || '',
        type: 'Retail',
        country: 'US',
        currency: 'USD'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createBusiness(
                formData.name,
                formData.type,
                formData.country,
                formData.currency,
                'business' // Defaulting plan for flow (can be derived or separate step)
                // Prompt says: "Assign: role ADMIN, businessId".
                // Note: SubPlan usually selected during Signup. 
                // For now, defaulting to 'business' or 'free' based on implementation plan or logic.
                // Let's assume 'business' trial or carry over if we stored it.
            );
            // Redirect happens via App.tsx state change detecting businessId
        } catch (error) {
            console.error(error);
            alert("Failed to create business");
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Create Your Business
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Setup your business profile to start managing orders.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Business Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="My Coffee Shop"
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Business Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:text-white"
                            >
                                <option value="Retail">Retail</option>
                                <option value="Cafe">Cafe</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Country
                                </label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:text-white"
                                >
                                    <option value="US">United States</option>
                                    <option value="AE">UAE</option>
                                    <option value="IN">India</option>
                                    <option value="UK">UK</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Currency
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:text-white"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="AED">AED</option>
                                    <option value="INR">INR (₹)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={logout}
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Logout
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Business'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
